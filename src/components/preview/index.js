import PreviewItem from './index.vue'
import { render, createVNode } from 'vue'

export default {
  install: (app) => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const instance = createVNode(PreviewItem)

    render(instance, container)

    app.config.globalProperties.$previewImg = function(
      urlList = [],
      initialIndex = 0,
      messages = [],
      onSwitch = () => {}
    ) {
      instance.component.props.urlList = urlList
      instance.component.props.initialIndex = initialIndex
      instance.component.props.messages = messages
      instance.component.props.onSwitch = onSwitch
      instance.component.proxy.show = true
    }
  }
}
