import { ElMessage } from 'element-plus'
import Clipboard from 'clipboard'

/** 普通复制+electron复制
 *
 * @param {Event} event
 * @param {String} text
 */
const copyClipboard = (event, text) => {
  const copyText = text || event.currentTarget.getAttribute('data-clipboard-text')
  if (!copyText) {
    return
  }

  const clipboard = new Clipboard(event.currentTarget, {
    text: copyText
  })
  clipboard.on('success', () => {
    ElMessage.success('复制成功')
    clipboard.destroy()
  })
  clipboard.on('error', () => {
    ElMessage.error('复制失败')
    clipboard.destroy()
  })
  clipboard.onClick(event)
}

export default copyClipboard
