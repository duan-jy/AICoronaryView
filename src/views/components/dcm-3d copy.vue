<style lang="less" scoped>
.artery-icon {
  &.icon-xinzang {
    font-size: 18px;
    background-color: #ac513d;

    &.active {
      background-color: #e9370e;
    }
  }
}

.artery-three {
  background-color: #000;
}

.anchor-three {
  position: absolute;
  width: 5px;
  height: 5px;
  z-index: 1000;
  background-color: #e9370e;
}

.loading-content {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 20;
}

.operate-item.icon-sudu-xian.is-draw {
  color: #0aed1d;
}
</style>
<template>
  <div
    class="artery-three"
    id="artery-three"
    @dblclick="viewScale('artery-3d')"
  >
    <canvas class="dcm-content" id="three-canvas"></canvas>
    <DcmMsg
      scale-key="artery-3d"
      :showPush="false"
      :hasBlTools="true"
      :isShowWwWc="false"
      :imgIndex="0"
      :part="part"
      :patientMsg="patientMsg"
      @refreshImage="refreshImage"
    >
      <i
        :class="[
          'operate-item artery-icon icon-xinzang',
          heartShow ? 'active' : ''
        ]"
        :title="`${heartShow ? '隐藏' : '隐藏'}心脏`"
        @click.stop="toShowHeart"
      />
      <i
        :class="[
          'operate-item artery-icon icon-sudu-xian',
          isDrawLine ? 'is-draw' : ''
        ]"
        title="中心线"
        @click.stop="toShowLine"
      />
    </DcmMsg>
    <div
      v-if="isLoaded"
      v-loading="isLoaded"
      class="loading-content"
      element-loading-text="3D模型加载中"
      element-loading-background="rgba(0, 0, 0, 1)"
    />
    <!-- <div
      class="anchor-three"
      :style="{
        left: `${anchorLeft}px`,
        top: `${anchorTop}px`,
      }"
    ></div> -->
  </div>
</template>

<script>
import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
// import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'

import { WEBGL } from 'three/examples/jsm/WebGL.js'

import ResourceTracker from '@/utils/3d-dispose'

// points：中心线点坐标
// points_count：点数目
// FrenetNormal：主法向量
// FrenetBinormal：次法向量
// FrenetTangent：切向量
// Curvature：曲率
// Radius：半径
// Abscissas：距离起点距离
// ParallelTransportNormals：平行法线
// Torsion:挠率
// points:点坐标

const coronaryTexture = './coronary-assets/coronary.jpg'
const heartTexture = './coronary-assets/heart.jpg'

import { getJsonData, stlload } from '@/api/index'

import DcmMsg from '@/components/dcm-msg.vue'

import arteryBus from '@/utils/arteryBus'

import { mapGetters } from 'vuex'
import { isUnkown } from '@/utils/artery'

let threeScene = null
let renderer = null
let controls = null
let heartMesh = null
// let coronaryMesh = null
let ballMesh = null
let labelTextMeshs = null
let actorMeshList = null
let centerLine = null

let timeId1 = null
let timeId2 = null

let textFont = null

let resMgr = null
let track = null

let actorMesh = null

let rotationMatrix = null
let targetQuaternion = null

let clock = null

let textureLoader = null

let loaderSTL = null

let lineMeshList = []

function resetData() {
  threeScene = null
  renderer = null
  controls = null
  heartMesh = null
  ballMesh = null

  labelTextMeshs = null
  actorMeshList = null
  centerLine = null

  if (timeId1 !== null) {
    clearTimeout(timeId1)
  }
  timeId1 = null
  timeId2 = null
  if (timeId2 !== null) {
    clearTimeout(timeId2)
  }

  textFont = null

  resMgr = null
  track = null

  actorMesh = null

  rotationMatrix = null
  targetQuaternion = null

  clock = null

  textureLoader = null

  loaderSTL = null

  lineMeshList = null
}

export default {
  // name: '',
  components: {
    DcmMsg
  },
  props: {
    threeData: {
      type: Object,
      default: () => ({})
    },
    patientMsg: {
      type: Object,
      default: () => ({})
    },
    workingPath: {
      type: String,
      default: ''
    },
    showMsg: {
      type: Boolean,
      default: false
    },
    renderedList: {
      type: String,
      default: ''
    }
  },
  data() {
    const FPS = 30
    const renderT = 1 / FPS
    const timeS = 0
    return {
      part: 'ARTERY-THREE',
      camera: null,
      requestAnimationFrameID: 0,
      isInit: true,
      isLoaded: true, // 是否加载完成
      heartShow: true,
      oriPointIndex: 0,
      anchorLeft: 0,
      anchorTop: 0,
      isArteryEdit: false, // 是否血管编辑
      meshScale: 1, // mesh 的缩放值
      renderT,
      timeS,
      canvasEl: null,
      arteryThreeEl: null,
      isDrawLine: false,
      lineActive: {
        key: '',
        uuid: ''
      }
    }
  },
  computed: {
    ...mapGetters(['scaleView', 'rawArteryList', 'arteryList', 'activeArtery'])
  },
  watch: {
    arteryList: {
      handler(newVal, oldVal) {
        this.updateRenderText()
      },
      deep: true
    },
    activeArtery(newVal, oldVal) {
      if (newVal) {
        this.arteryChange()
      }
    },
    'camera.quaternion': {
      handler(newVal, oldVal) {
        this.changeLabelMesh()
      },
      deep: true
    }
  },
  created() {
    arteryBus.on('renderedListChange', (list) => {
      this.loadData(list)
    })

    arteryBus.on('setOriPointIndex', (index) => {
      if (this.oriPointIndex !== index) {
        this.oriPointIndex = index
        this.renderActor()
      }
    })

    arteryBus.on('editArtery', (isEdit) => {
      this.isArteryEdit = isEdit
      this.showHideTextMesh()
      // 编辑血管状态自动隐藏
      if (heartMesh && this.heartShow) {
        this.heartShow = false
        heartMesh.material.visible = false
      }
    })
    resetData()

    actorMeshList = []
    lineMeshList = {}
    labelTextMeshs = {}
    centerLine = {}
    resMgr = new ResourceTracker()
    track = resMgr.track.bind(resMgr)
    clock = new THREE.Clock()
    textureLoader = track(new THREE.TextureLoader())
    loaderSTL = new FBXLoader()

    window.addEventListener('beforeunload', (e) => {
      console.log('3D-beforeunload')
      this.clearALL()
      arteryBus.off('*')
      window.removeEventListener('beforeunload', () => {}) // 移除这个监听
    })
  },
  mounted() {
    this.arteryThreeEl = document.getElementById('artery-three')
    this.canvasEl = document.getElementById('three-canvas')
  },
  beforeUnmount() {
    // window.cancelAnimationFrame()
    this.clearALL()
    this.arteryThreeEl = null
    this.canvasEl = null
  },
  unmounted() {},
  methods: {
    clearALL() {
      if (!threeScene) {
        return
      }
      try {
        threeScene.clear()
        resMgr && resMgr.dispose()
        renderer.dispose()
        renderer.forceContextLoss()
        renderer.content = null
        cancelAnimationFrame(this.requestAnimationFrameID) // 去除animationFrame
        const gl = renderer.domElement.getContext('webgl')
        gl && gl.getExtension('WEBGL_lose_context').loseContext()
        resetData()
      } catch (e) {
        resetData()
        console.log(e)
      }
    },
    async refreshImage() {
      threeScene.clear()
      resetData()
      await this.initScene()
      this.partLoad()
    },
    viewScale(scaleKey) {
      const key = this.scaleView === scaleKey ? '' : scaleKey
      this.$store.dispatch('dcm/setScaleView', key)
    },
    arteryChange() {
      this.oriPointIndex = 0
      this.updateRenderText()
      this.renderActor()
      if (this.isDrawLine) {
        this.removLine(() => {
          this.addLine()
        })
      }
    },
    changeLabelMesh() {
      for (const key in labelTextMeshs) {
        if (Object.hasOwnProperty.call(labelTextMeshs, key)) {
          const mesh = labelTextMeshs[key].mesh
          mesh.quaternion.copy(this.camera.quaternion)
        }
      }
    },
    toShowHeart() {
      if (heartMesh) {
        this.heartShow = !this.heartShow
        heartMesh.material.visible = this.heartShow
      }
    },
    async threeInit() {
      // eslint-disable-next-line no-async-promise-executor
      await this.initScene()
      const animate = () => {
        this.requestAnimationFrameID = requestAnimationFrame(animate)
        this.render()
      }

      if (WEBGL.isWebGLAvailable()) {
        animate()
      } else {
        const warning = WEBGL.getWebGLErrorMessage()
        this.arteryThreeEl.appendChild(warning)
      }
    },
    async loadData(list) {
      if (!this.isLoaded) {
        return
      }
      list = list ? list.split(',') : []
      if (
        list.includes('Ori') &&
        list.includes('SPR') &&
        list.includes('CPR') &&
        list.includes('PROBE')
      ) {
        this.threeInit()
        this.partLoad()
      }
    },
    async partLoad() {
      const threeData = this.threeData
      this.isLoaded = true
      try {
        const centerJsonPath = threeData.centerline_info_path || ''
        if (!centerJsonPath) {
          return
        }
        const workPath = this.workingPath
        const jsonpath = `${workPath}/${centerJsonPath}`
        const centerJson = await getJsonData(jsonpath)
        if (!centerJson) {
          return
        }
        centerLine = centerJson
        const coronaryPath = threeData.artery_stl_path || ''
        const heartPath = threeData.heart_stl_path || ''
        if (!coronaryPath || !heartPath) {
          return
        }
        await this.loadCoronaryStl(workPath, coronaryPath)
        this.isLoaded = false
        await this.loadHeartStl(workPath, heartPath)

        this.$emit('setRenderedList', this.part, 'add')

        if (this.activeArtery) {
          // TODO: 聚集到activeArtery
          this.$nextTick(() => {
            this.renderText()
            this.renderActor()
          })
        }
      } catch (error) {
        console.log(error)
      }
    },
    initScene() {
      return new Promise((resovle, reject) => {
        try {
          threeScene = new THREE.Scene()
          threeScene.background = track(new THREE.Color(0x000000))
          const ambientLight = track(new THREE.AmbientLight(0xffffff, 1))
          threeScene.add(ambientLight)
          const directionalLight = track(
            new THREE.DirectionalLight(0xffffff, 1)
          )
          directionalLight.position.set(0, 0, 100)
          threeScene.add(directionalLight)

          const directionalLight2 = track(
            new THREE.DirectionalLight(0xffffff, 1)
          )
          directionalLight2.position.set(0, 0, -100)
          threeScene.add(directionalLight2)

          const w = this.arteryThreeEl.offsetWidth
          const h = this.arteryThreeEl.offsetHeight
          const aspectRatio = w / h
          this.camera = track(
            new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 10000)
          )
          // 正常
          this.camera.position.set(250, 550, 60)

          renderer = new THREE.WebGLRenderer({
            canvas: this.canvasEl,
            antialias: true,
            autoClear: true
          })

          controls = new TrackballControls(this.camera, renderer.domElement)

          controls.noZoom = false
          controls.noPan = true
          controls.enableKeys = false
          controls.rotateSpeed = 5
          controls.target.set(0, 0, 0)
          controls.update()
          controls.enableDamping = true
          resovle()
        } catch (error) {
          reject()
        }
      })
    },
    loadHeartStl(workPath, heartPath) {
      return new Promise((resolve, reject) => {
        if (!heartPath) {
          reject(new Error('路径不对'))
        }
        try {
          const stlPath = `${workPath}/${heartPath}`
          // stlPath = stlPath.replace('.stl', '.fbx')
          const texture = this.loadTexture(heartTexture)
          loaderSTL.load(stlload(stlPath), (geometry) => {
            for (const geometryItem of geometry.children) {
              const material = new THREE.MeshPhongMaterial({
                map: texture,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7,
                visible: false // visible属性值
              })
              heartMesh = new THREE.Mesh(geometryItem.geometry, material)
              timeId2 = setTimeout(() => {
                threeScene.add(heartMesh)
                heartMesh.material.visible = true
                // sceneGroup.add(heartMesh)
              }, 0)
            }

            resolve()
          })
        } catch (error) {
          reject(error)
        }
      })
    },
    loadTexture(png) {
      const texture = textureLoader.load(png)
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.magFilter = THREE.NearestFilter
      texture.repeat.set(100, 100)
      texture.repeat.x = 0
      texture.repeat.y = 0
      texture.needsUpdate = true
      return texture
    },
    loadCoronaryStl(workPath, coronaryPath) {
      return new Promise((resolve, reject) => {
        if (!coronaryPath) {
          reject(new Error('路径不正确'))
        }
        try {
          const stlpath = `${workPath}/${coronaryPath}`
          // stlpath = stlpath.replace('.stl', '.fbx')
          const texture = this.loadTexture(coronaryTexture)
          loaderSTL.load(stlload(stlpath), (geometry) => {
            for (const geometryItem of geometry.children) {
              geometryItem.geometry.computeBoundingBox()
              geometryItem.geometry.computeBoundingSphere()
              const material = new THREE.MeshStandardMaterial({
                map: texture,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8,
                reflectivity: 0.2,
                refractionRatio: 2,
                combine: THREE.MixOperation,
                roughness: 2
              })
              const mesh = new THREE.Mesh(geometryItem.geometry, material)
              threeScene.add(mesh)
            }
            this.render()

            const geometryData = geometry.children[0].geometry
            const center = geometryData.boundingSphere.center
            const transpos = this.transLateCenter(center.x, center.y, center.z)
            this.camera.position.set(...transpos)
            this.camera.up = new THREE.Vector3(-0.609, -0.4425, -0.6582)
            controls.target = center

            this.camera.lookAt(center)
            resolve()
          })
        } catch (error) {
          reject()
        }
      })
    },
    resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const needResize = canvas.width !== width || canvas.height !== height
      if (needResize) {
        renderer.setSize(width, height, false)
      }
      return needResize
    },
    render() {
      const T = clock.getDelta()
      this.timeS = this.timeS + T
      if (this.timeS > this.renderT) {
        if (this.resizeRendererToDisplaySize(renderer)) {
          const aspectRatio =
            this.canvasEl.offsetWidth / this.canvasEl.offsetHeight
          renderer.setSize(
            this.canvasEl.clientWidth,
            this.canvasEl.clientHeight,
            false
          )
          this.camera.aspect = aspectRatio
          this.camera.updateProjectionMatrix()
        }
        if (!renderer.autoClear) {
          renderer.clear()
        }
        controls.update()
        // console.log('camera', this.camera.position)
        renderer.render(threeScene, this.camera)
        this.timeS = 0
        requestAnimationFrame(this.render)
      }
    },
    setActorGeometry() {
      if (actorMesh) {
        return
      }
      const radiusTop = 0.5 // 圆柱的顶部半径，默认值是1。
      const radiusBottom = 1 // 圆柱的底部半径，默认值是1。
      const height = 2.27 // 圆柱的高度，默认值是1。
      const radialSegments = 27 // 圆柱侧面周围的分段数，默认为8。
      const heightSegments = 2 // 圆柱侧面沿着其高度的分段数，默认值为1。
      const openEnded = false // 一个Boolean值，指明该圆锥的底面是开放的还是封顶的。默认值为false，即其底面默认是封顶的。
      const thetaStart = 0 // 第一个分段的起始角度，默认为0。（three o'clock position）
      const thetaLength = 2 * Math.PI // 圆柱底面圆扇区的中心角，通常被称为“θ”（西塔）。默认值是2*Pi，这使其成为一个完整的圆柱。

      const geometry = track(
        new THREE.CylinderGeometry(
          radiusTop,
          radiusBottom,
          height,
          radialSegments,
          heightSegments,
          openEnded,
          thetaStart,
          thetaLength
        )
      )
      geometry.rotateX((Math.PI / 180) * 90)

      const material = track(new THREE.MeshPhongMaterial({ color: 0xffff00 }))

      actorMesh = new THREE.Mesh(geometry, material)
    },
    renderActor() {
      const pointIndex = this.oriPointIndex
      if (this.isLoaded) {
        return
      }
      const data = centerLine[this.activeArtery]
      if (!data) {
        return
      }
      const point = data.points[pointIndex]
      const sp = track(new THREE.Vector3(...point))
      const s = 2 // 缩放比例
      const fnp = data.FrenetNormal[pointIndex]
      const fbp = data.FrenetBinormal[pointIndex]
      const r = data.Radius[pointIndex]
      const { x, y, z } = sp
      const [npx, npy, npz] = fnp
      const [bpx, bpy, bpz] = fbp
      const actors = [
        {
          x: x + npx * r * s,
          y: y + npy * r * s,
          z: z + npz * r * s
        },
        {
          x: x - npx * r * s,
          y: y - npy * r * s,
          z: z - npz * r * s
        },
        {
          x: x + bpx * r * s,
          y: y + bpy * r * s,
          z: z + bpz * r * s
        },
        {
          x: x - bpx * r * s,
          y: y - bpy * r * s,
          z: z - bpz * r * s
        }
      ]
      this.setActorGeometry()

      actors.forEach((actor, index) => {
        let mesh = null
        if (!actorMeshList[index]) {
          mesh = track(actorMesh.clone())
          actorMeshList.push(mesh)
          threeScene.add(mesh)
          // sceneGroup.add(mesh)
        } else {
          mesh = actorMeshList[index]
        }
        mesh.position.set(actor.x, actor.y, actor.z)
        // 转向
        if (!rotationMatrix) {
          rotationMatrix = track(new THREE.Matrix4())
        }
        if (!targetQuaternion) {
          targetQuaternion = track(new THREE.Quaternion())
        }
        rotationMatrix.lookAt(sp, mesh.position, mesh.up)
        targetQuaternion.setFromRotationMatrix(rotationMatrix)

        if (!mesh.quaternion.equals(targetQuaternion)) {
          mesh.quaternion.rotateTowards(targetQuaternion, 4)
        }
      })
    },
    addLine() {
      if (!centerLine[this.activeArtery]) {
        return
      }
      const nowLine = centerLine[this.activeArtery]
      const material = new LineMaterial({
        color: 0x0aed1d,
        linewidth: 8
      })
      material.resolution.set(window.innerWidth, window.innerHeight)
      const points = []
      nowLine.points.forEach((v) => points.push(...v))

      const geometry = new LineGeometry()
      geometry.setPositions(points)
      const line = new Line2(geometry, material)
      line.computeLineDistances()
      threeScene.add(line)
      this.lineActive = {
        key: this.activeArtery,
        uuid: line.uuid
      }
    },
    removLine(cb) {
      // 中心线
      if (!this.lineActive.uuid) {
        return
      }
      const mesh = threeScene.children.find(
        (item) => item.uuid === this.lineActive.uuid
      )
      if (mesh) {
        threeScene.remove(mesh)
      }
      this.lineActive.key = ''
      this.lineActive.uuid = ''
      if (cb) {
        cb()
      }
    },
    toShowLine() {
      this.isDrawLine = !this.isDrawLine
      if (this.isDrawLine) {
        this.addLine()
      } else {
        this.removLine()
      }
    },
    loadTextFont() {
      return new Promise(async(resolve, reject) => {
        if (textFont) {
          resolve()
        } else {
          try {
            textFont = await new FontLoader().loadAsync(
              './coronary-assets/helvetiker_regular.typeface.json'
            )
            resolve()
          } catch (error) {
            reject(error)
          }
        }
      })
    },
    async renderText() {
      await this.loadTextFont()

      for (const key in labelTextMeshs) {
        if (Object.hasOwnProperty.call(labelTextMeshs, key)) {
          const mesh = labelTextMeshs[key].mesh
          threeScene.remove(mesh)
          delete labelTextMeshs[key]
        }
      }

      const textOptions = {
        font: textFont,
        size: 7,
        height: 0.5,
        curveSegments: 12,
        bevelThickness: 2,
        bevelSize: 5,
        bevelEnabled: false
      }
      // const textGeometry
      const textMesh = track(new THREE.Mesh())
      const textMaterial = track(new THREE.MeshPhongMaterial())

      for (const artery of this.arteryList) {
        // 找到原始名称
        const arteryId = artery.id
        const data = centerLine[arteryId]
        if (!data) {
          continue
        }
        const points = data.points
        const point = points[points.length - 1]
        const textGeo = track(new TextGeometry(artery.name, textOptions))
        // 查看原始名和聚焦的一致不
        const color = arteryId === this.activeArtery ? 0xff4500 : 0xffffff
        const material = textMaterial.clone()
        material.color.set(color)
        const mesh = track(textMesh.clone())
        mesh.geometry = textGeo
        mesh.material = material
        const [x, y, z] = point
        // 如果不是编辑状态
        if (!this.isArteryEdit && isUnkown(artery.name)) {
          mesh.material.visible = false
        }
        threeScene.add(mesh)
        mesh.position.set(x, y, z)
        mesh.quaternion.copy(this.camera.quaternion)

        // 拿原始的血管名当key
        labelTextMeshs[arteryId] = {
          name: artery.name,
          mesh: mesh
        }
      }
    },
    updateRenderText() {
      for (const arteryId in labelTextMeshs) {
        if (Object.hasOwnProperty.call(labelTextMeshs, arteryId)) {
          const { mesh, name } = labelTextMeshs[arteryId]
          const item = this.arteryList.find((item) => item.id === arteryId)
          // 修改了名字
          if (name !== item.name) {
            labelTextMeshs[arteryId].name = item.name
            const textOptions = {
              font: textFont,
              size: 7,
              height: 0.5,
              curveSegments: 12,
              bevelThickness: 2,
              bevelSize: 5,
              bevelEnabled: false
            }
            const textGeo = track(new TextGeometry(item.name, textOptions))
            mesh.geometry = textGeo
          }
          const color = arteryId === this.activeArtery ? 0xff4500 : 0xffffff
          mesh.material.color = track(new THREE.Color(color))
        }
      }
    },
    // 显示隐藏
    showHideTextMesh() {
      for (const arteryId in labelTextMeshs) {
        if (Object.hasOwnProperty.call(labelTextMeshs, arteryId)) {
          const { mesh, name } = labelTextMeshs[arteryId]
          if (!this.isArteryEdit) {
            if (isUnkown(name)) {
              mesh.material.visible = false
            }
          } else {
            mesh.material.visible = true
          }
        }
      }
    },
    /**
     *
     * @param {Number} x 屏幕坐标 x
     * @param {Number} y 屏幕坐标 y
     * @param {Number} targetZ  z轴 默认为0
     */
    pointToThreePos(evt, targetZ = 0) {
      evt.preventDefault()
      const x = evt.offsetX
      const y = evt.offsetY
      const vec = new THREE.Vector3()
      // const pos = new THREE.Vector3()
      const canvas = this.$refs['three-canvas']
      const camera = this.camera
      // 通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
      vec.set(
        (x / canvas.clientWidth) * 2 - 1,
        -(y / canvas.clientHeight) * 2 + 1,
        0.5
      )
      vec.unproject(camera)
      var raycaster = new THREE.Raycaster(
        camera.position,
        vec.sub(camera.position).normalize()
      )
      var intersects = raycaster.intersectObjects(threeScene.children)
      if (intersects.length) {
        const pos = intersects[0].point
        console.log('pos', pos)
      }
    },
    /**
     * 计算相机 fov 的函数
     * @param d : 在相机前方 d 距离
     * @param w : 想要看到最大正方形区域边长为 w
     */
    calcFov(d, maxW) {
      const w = this.arteryThreeEl.offsetWidth
      const h = this.arteryThreeEl.offsetHeight
      const aspectRatio = w / h
      let vertical = maxW
      if (aspectRatio < 1) {
        vertical = vertical / aspectRatio
      }
      const f = Math.atan(vertical / d / 2) * 2 * (180 / Math.PI)
      return f
    },
    transLateCenter(x, y, z) {
      const matrix = new THREE.Matrix4()
      matrix.makeTranslation(52.024, 116.719, -126.592)
      // 三维向量表示一个顶点坐标
      const pos1 = new THREE.Vector3(x, y, z)
      // 向量进行矩阵变换
      const pos2 = pos1.clone().applyMatrix4(matrix)
      return pos2
    }
  }
}
</script>
