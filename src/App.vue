<template>
  <router-view v-if="isRouterActive"></router-view>
</template>

<script setup>
import { ref, nextTick, provide } from 'vue'
import { useStore } from 'vuex'
import storage from './utils/storage'
import { PROJECT_KEY } from './utils/source'

const vertical = storage.get(`${PROJECT_KEY}_VERTICAL`, '0')

const isVertical = Number(vertical) === 1

const store = useStore()

store.dispatch('dcm/setVertical', isVertical)

store.dispatch('app/getAppConfig')

const isRouterActive = ref(true)

const reload = () => {
  isRouterActive.value = false
  store.dispatch('dcm/setScaleView', '')
  store.dispatch('dcm/setActiveTools', '')
  store.dispatch('app/getAppConfig')
  nextTick(() => {
    isRouterActive.value = true
  })
}

provide('reload', reload)

cornerstoneTools.init({
  globalToolSyncEnabled: true
})
</script>

