import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppState } from '@/types'
import { api } from '@/api'

export const useAppStore = defineStore('app', () => {
  // State
  const loading = ref(false)
  const loadingText = ref('')
  const theme = ref<'dark' | 'light'>('dark')
  const locale = ref('zh-CN')
  const appConfig = ref<Record<string, any>>({})
  const vertical = ref(false)

  // Getters
  const isDark = computed(() => theme.value === 'dark')

  // Actions
  function setLoading(value: boolean, text = '') {
    loading.value = value
    loadingText.value = text
  }

  function setTheme(value: 'dark' | 'light') {
    theme.value = value
    document.documentElement.setAttribute('data-theme', value)
  }

  function setVertical(value: boolean) {
    vertical.value = value
  }

  async function getAppConfig() {
    try {
      const config = await api.getConfig()
      appConfig.value = config || {}
    } catch (error) {
      console.error('Failed to get app config:', error)
    }
  }

  function $reset() {
    loading.value = false
    loadingText.value = ''
    theme.value = 'dark'
    locale.value = 'zh-CN'
  }

  return {
    // State
    loading,
    loadingText,
    theme,
    locale,
    appConfig,
    vertical,
    // Getters
    isDark,
    // Actions
    setLoading,
    setTheme,
    setVertical,
    getAppConfig,
    $reset
  }
})
