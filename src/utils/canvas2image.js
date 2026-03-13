/* modified version of: https://github.com/hongru/canvas2image/blob/master/canvas2image.js */
/* based on version 1.0.5 */

/**
 * covert canvas to image
 * and save the image file
 */

// check if support sth.
var $support = (function () {
  var canvas = document.createElement('canvas')
  var ctx = canvas.getContext('2d')

  return {
    canvas: !!ctx,
    imageData: !!ctx.getImageData,
    dataURL: !!canvas.toDataURL,
    btoa: !!window.btoa
  }
})()

var downloadMime = 'image/octet-stream'

function scaleCanvas(canvas, width, height) {
  var w = canvas.width
  var h = canvas.height
  if (width === undefined) {
    width = w
  }
  if (height === undefined) {
    height = h
  }

  var retCanvas = document.createElement('canvas')
  var retCtx = retCanvas.getContext('2d')
  retCanvas.width = width
  retCanvas.height = height
  retCtx.drawImage(canvas, 0, 0, w, h, 0, 0, width, height)
  return retCanvas
}

function getDataURL(canvas, type, width, height) {
  canvas = scaleCanvas(canvas, width, height)
  return canvas.toDataURL(type)
}
function saveFile(strData, fileType, fileName = 'download') {
  const saveLink = document.createElement('a')
  saveLink.download = fileName + '.' + fileType
  saveLink.href = strData
  saveLink.click()
}

function genImage(strData) {
  var img = document.createElement('img')
  img.src = strData
  return img
}

function fixType(type) {
  type = type.toLowerCase().replace(/jpg/i, 'jpeg')
  var r = type.match(/png|jpeg|bmp|gif/)[0]
  return 'image/' + r
}

function encodeData(data) {
  if (!window.btoa) {
    throw new Error('btoa undefined')
  }
  var str = ''
  if (typeof data === 'string') {
    str = data
  } else {
    for (var i = 0; i < data.length; i++) {
      str += String.fromCharCode(data[i])
    }
  }

  return btoa(str)
}

function getImageData(canvas) {
  var w = canvas.width
  var h = canvas.height
  return canvas.getContext('2d').getImageData(0, 0, w, h)
}

function makeURI(strData, type) {
  return 'data:' + type + ';base64,' + strData
}

/**
 * create bitmap image
 * 按照规则生成图片响应头和响应体
 */
var genBitmapImage = function (oData) {
  //
  // BITMAPFILEHEADER: http://msdn.microsoft.com/en-us/library/windows/desktop/dd183374(v=vs.85).aspx
  // BITMAPINFOHEADER: http://msdn.microsoft.com/en-us/library/dd183376.aspx
  //

  var biWidth = oData.width
  var biHeight = oData.height
  var biSizeImage = biWidth * biHeight * 3
  var bfSize = biSizeImage + 54 // total header size = 54 bytes

  //
  //  typedef struct tagBITMAPFILEHEADER {
  //  	WORD bfType;
  //  	DWORD bfSize;
  //  	WORD bfReserved1;
  //  	WORD bfReserved2;
  //  	DWORD bfOffBits;
  //  } BITMAPFILEHEADER;
  //
  var BITMAPFILEHEADER = [
    // WORD bfType -- The file type signature; must be "BM"
    0x42,
    0x4d,
    // DWORD bfSize -- The size, in bytes, of the bitmap file
    bfSize & 0xff,
    (bfSize >> 8) & 0xff,
    (bfSize >> 16) & 0xff,
    (bfSize >> 24) & 0xff,
    // WORD bfReserved1 -- Reserved; must be zero
    0,
    0,
    // WORD bfReserved2 -- Reserved; must be zero
    0,
    0,
    // DWORD bfOffBits -- The offset, in bytes, from the beginning of the BITMAPFILEHEADER structure to the bitmap bits.
    54,
    0,
    0,
    0
  ]

  //
  //  typedef struct tagBITMAPINFOHEADER {
  //  	DWORD biSize;
  //  	LONG  biWidth;
  //  	LONG  biHeight;
  //  	WORD  biPlanes;
  //  	WORD  biBitCount;
  //  	DWORD biCompression;
  //  	DWORD biSizeImage;
  //  	LONG  biXPelsPerMeter;
  //  	LONG  biYPelsPerMeter;
  //  	DWORD biClrUsed;
  //  	DWORD biClrImportant;
  //  } BITMAPINFOHEADER, *PBITMAPINFOHEADER;
  //
  var BITMAPINFOHEADER = [
    // DWORD biSize -- The number of bytes required by the structure
    40,
    0,
    0,
    0,
    // LONG biWidth -- The width of the bitmap, in pixels
    biWidth & 0xff,
    (biWidth >> 8) & 0xff,
    (biWidth >> 16) & 0xff,
    (biWidth >> 24) & 0xff,
    // LONG biHeight -- The height of the bitmap, in pixels
    biHeight & 0xff,
    (biHeight >> 8) & 0xff,
    (biHeight >> 16) & 0xff,
    (biHeight >> 24) & 0xff,
    // WORD biPlanes -- The number of planes for the target device. This value must be set to 1
    1,
    0,
    // WORD biBitCount -- The number of bits-per-pixel, 24 bits-per-pixel -- the bitmap
    // has a maximum of 2^24 colors (16777216, Truecolor)
    24,
    0,
    // DWORD biCompression -- The type of compression, BI_RGB (code 0) -- uncompressed
    0,
    0,
    0,
    0,
    // DWORD biSizeImage -- The size, in bytes, of the image. This may be set to zero for BI_RGB bitmaps
    biSizeImage & 0xff,
    (biSizeImage >> 8) & 0xff,
    (biSizeImage >> 16) & 0xff,
    (biSizeImage >> 24) & 0xff,
    // LONG biXPelsPerMeter, unused
    0,
    0,
    0,
    0,
    // LONG biYPelsPerMeter, unused
    0,
    0,
    0,
    0,
    // DWORD biClrUsed, the number of color indexes of palette, unused
    0,
    0,
    0,
    0,
    // DWORD biClrImportant, unused
    0,
    0,
    0,
    0
  ]

  var iPadding = (4 - ((biWidth * 3) % 4)) % 4

  var aImgData = oData.data

  var strPixelData = ''
  var biWidth4 = biWidth << 2
  var y = biHeight
  var fromCharCode = String.fromCharCode

  do {
    var iOffsetY = biWidth4 * (y - 1)
    var strPixelRow = ''
    for (var x = 0; x < biWidth; x++) {
      var iOffsetX = x << 2
      strPixelRow +=
        fromCharCode(aImgData[iOffsetY + iOffsetX + 2]) +
        fromCharCode(aImgData[iOffsetY + iOffsetX + 1]) +
        fromCharCode(aImgData[iOffsetY + iOffsetX])
    }

    for (var c = 0; c < iPadding; c++) {
      strPixelRow += String.fromCharCode(0)
    }

    strPixelData += strPixelRow
  } while (--y)

  var strEncoded =
    encodeData(BITMAPFILEHEADER.concat(BITMAPINFOHEADER)) +
    encodeData(strPixelData)

  return strEncoded
}

function genBitmapArrayBuffer(oData) {
  const biWidth = oData.width;
  const biHeight = oData.height;
  const biSizeImage = biWidth * biHeight * 3;
  const bfSize = biSizeImage + 54;

  const iPadding = (4 - ((biWidth * 3) % 4)) % 4;

  // BMP 文件的总大小
  const buffer = new ArrayBuffer(bfSize);
  const dv = new DataView(buffer);

  let p = 0;

  // --- BITMAPFILEHEADER ---
  dv.setUint8(p++, 0x42); // 'B'
  dv.setUint8(p++, 0x4D); // 'M'
  dv.setUint32(p, bfSize, true); p += 4; // size
  dv.setUint16(p, 0, true); p += 2;
  dv.setUint16(p, 0, true); p += 2;
  dv.setUint32(p, 54, true); p += 4; // offset

  // --- BITMAPINFOHEADER ---
  dv.setUint32(p, 40, true); p += 4; // header size
  dv.setInt32(p, biWidth, true); p += 4;
  dv.setInt32(p, biHeight, true); p += 4;
  dv.setUint16(p, 1, true); p += 2; // planes
  dv.setUint16(p, 24, true); p += 2; // 24-bit
  dv.setUint32(p, 0, true); p += 4; // BI_RGB
  dv.setUint32(p, biSizeImage, true); p += 4;
  dv.setInt32(p, 0, true); p += 4;
  dv.setInt32(p, 0, true); p += 4;
  dv.setUint32(p, 0, true); p += 4;
  dv.setUint32(p, 0, true); p += 4;

  // --- Pixel Data ---
  const rowStride = biWidth * 3 + iPadding;
  const data = oData.data;

  for (let y = biHeight - 1; y >= 0; y--) {
    for (let x = 0; x < biWidth; x++) {
      const idx = (y * biWidth + x) * 4;
      dv.setUint8(p++, data[idx]); // B
      dv.setUint8(p++, data[idx + 1]); // G
      dv.setUint8(p++, data[idx + 2]);     // R
    }
    for (let i = 0; i < iPadding; i++) dv.setUint8(p++, 0);
  }

  return buffer;
}


/**
 * saveAsImage
 * @param canvasElement
 * @param {String} image type
 * @param {Number} [optional] png width
 * @param {Number} [optional] png height
 */
export const saveAsImage = (canvas, width, height, fileType) => {
  if ($support.canvas && $support.dataURL) {
    if (typeof canvas === 'string') {
      canvas = document.getElementById(canvas)
    }
    if (!canvas) {
      throw new Error('no canvas element find')
    }
    if (fileType === undefined) {
      fileType = 'png'
    }
    const type = fixType(fileType)
    let strData = ''
    if (/bmp/.test(type)) {
      const imagedata = getImageData(scaleCanvas(canvas, width, height))
      strData = genBitmapImage(imagedata)
      saveFile(makeURI(strData, downloadMime), fileType)
    } else {
      strData = getDataURL(canvas, type, width, height)
      saveFile(strData.replace(type, downloadMime), fileType)
    }
  }
}

/** 通过dataurl 下载图像
 *
 * @param {string} imagedata
 * @param {string} fileType
 */
export const saveAsImageData = (imagedata, fileType) => {
  const type = fixType(fileType)
  if (/bmp/.test(type)) {
    const strData = genBitmapImage(imagedata)
    saveFile(makeURI(strData, downloadMime), fileType)
  } else {
    saveFile(imagedata.replace(type, downloadMime), fileType)
  }
}

export const convertToImage = function (canvas, width, height, type) {
  if ($support.canvas && $support.dataURL) {
    if (typeof canvas === 'string') {
      canvas = document.getElementById(canvas)
    }
    if (!canvas) {
      throw new Error('no canvas element find')
    }
    if (type === undefined) {
      type = 'png'
    }
    type = fixType(type)

    if (/bmp/.test(type)) {
      const imagedata = getImageData(scaleCanvas(canvas, width, height))
      const bufferData = genBitmapArrayBuffer(imagedata)
      return bufferData
    } else {
      return getDataURL(canvas, type, width, height)
    }
  }
}

export const saveAsPNG = (canvas, width, height) =>
  saveAsImage(canvas, width, height, 'png')

export const saveAsJPEG = (canvas, width, height) =>
  saveAsImage(canvas, width, height, 'jpeg')

export const saveAsGIF = (canvas, width, height) =>
  saveAsImage(canvas, width, height, 'gif')

export const saveAsBMP = (canvas, width, height) =>
  saveAsImage(canvas, width, height, 'bmp')

export const convertToPNG = (canvas, width, height) =>
  convertToImage(canvas, width, height, 'png')

export const convertToJPEG = (canvas, width, height) =>
  convertToImage(canvas, width, height, 'jpeg')

export const convertToGIF = (canvas, width, height) =>
  convertToImage(canvas, width, height, 'gif')

export const convertToBMP = (canvas, width, height) =>
  convertToImage(canvas, width, height, 'bmp')

export const saveAsPNGData = (imagedata) => saveAsImageData(imagedata, 'png')

export const saveAsJPEGData = (imagedata) => saveAsImageData(imagedata, 'jpeg')

export const saveAsGIFData = (imagedata) => saveAsImageData(imagedata, 'gif')

export const saveAsBMPData = (imagedata) => saveAsImageData(imagedata, 'bmp')
