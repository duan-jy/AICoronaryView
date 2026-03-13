<template>
  <el-select
    ref="varySelect"
    :style="{ width: selectValue.length ? '60px' : '125px' }"
    :class="{
      'inline-select': true,
      'is-multiple-empty': selectValue.length === 0
    }"
    v-model="selectValue"
    :multiple="true"
    :clearable="false"
    size="mini"
    :fit-input-width="false"
    placeholder="变异或术后选项"
    popper-class="common-options"
    @change="selectChange"
  >
    <el-checkbox-group v-model="selectValue">
      <el-option
        v-for="item in varyOptions"
        :key="item.value"
        :value="item.label"
        :label="item.label"
      >
        <el-checkbox style="pointer-events: none" :label="item.label" />
      </el-option>
    </el-checkbox-group>
  </el-select>
</template>

<script>
import { plaqueObj, varyOptions } from '@/utils/source'
export default {
  props: {
    bridge: {
      type: Boolean,
      default: false
    },
    stent: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectValue: []
    }
  },
  mounted() {
    this.selectValue = []
    for (const item of varyOptions) {
      if (this[item.alias]) {
        this.selectValue.push(item.label)
      }
    }
  },
  setup() {
    return {
      plaqueObj,
      varyOptions
    }
  },
  methods: {
    selectChange(value) {
      const selectVal = {}
      for (const item of varyOptions) {
        const status = value.indexOf(item.label) !== -1
        selectVal[item.alias] = status
      }
      const timer = setTimeout(() => {
        this.$refs.varySelect.blur()
        clearTimeout(timer)
      }, 100)
      this.$emit('varyChange', selectVal)
    }
  }
}
</script>
