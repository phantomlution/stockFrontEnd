/**
 * 获取 DOM 元素尺寸
 * @param element
 */
export const getElementSize = function(element) {
  if (element) {
    const rect = element.getBoundingClientRect()
    return {
      width: rect.width,
      height: rect.height
    }
  }
  return null
}


/**
 * 获取缩小比例
 * @param from
 * @param to
 */
export const getZoomOutRatio = function(from, to) {
  const fromWidth =  from.width
  const fromHeight = from.height
  const toWidth = to.width
  const toHeight = to.height

  const widthRatio = (fromWidth / toWidth > 1) ? toWidth / fromWidth : 1
  const heightRatio = (fromHeight / toHeight > 1) ? toHeight / fromHeight : 1

  return widthRatio > heightRatio ? heightRatio : widthRatio
}

export const idGenerator = {
  index: 0,
  next(prefix = 'random') {
    this.index++
    return `${ prefix }_${ new Date().getTime() }_${ this.index }`
  }
}

