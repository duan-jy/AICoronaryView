import dayjs from 'dayjs'

/** 格式化时间
 *
 * @param {date?: string | number | Date | dayjs.Dayjs} date
 * @param {string} format
 * @returns {dayjs.Dayjs}
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  return dayjs(date).format(format)
}
