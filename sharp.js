// 跨平台、高性能、无运行时依赖

const sharp = require('sharp');
const fs = require('fs');
const textToSvg = require('text-to-svg');


const { fontPath } = require('./config')

// 流转Buffer缓存
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const bufferList = []
    stream.on('data', data => {
      // 每一个data都是一个Buffer对象
      bufferList.push(data)
    })
    stream.on('error', err => {
      reject()
    })
    stream.on('end', () => {
      resolve(Buffer.concat(bufferList))
    })
  })
}

/**
 * 1、toFile
 * @param {String} basePicture 源文件路径
 * @param {String} newFilePath 新文件路径
 */
function writeTofile(basePicture, newFilePath) {
  sharp(basePicture)
    .rotate(20) // 旋转
    .resize(500, 500) //缩放
    .toFile(newFilePath)
}
// writeTofile(basePicture, `${__dirname}/static/云雾缭绕1.png`);

/**
 * 2、读取图片buffer
 * @param {String} basePicture 源文件路径
 */
function readFileBuffer(basePicture) {
  sharp(basePicture)
    .toBuffer()
    .then(data => {
      console.log(data)
    })
    .catch(err => {
      console.log(err)
    })
}
// readFileBuffer(basePicture);

/**
 * 3、对文件流进行处理
 * @param {String} basePicture 源文件路径
 */
function dealWithStream(basePicture) {
  // 读取文件流
  const readableStream = fs.createReadStream(basePicture)
  // 对流数据进行处理
  const transformer = sharp().resize({
    width: 200,
    height: 200,
    fit: sharp.fit.cover,
    position: sharp.strategy.entropy
  })
  // 将文件读取到的流数据写入transformer进行处理
  readableStream.pipe(transformer)

  // 将可写流转换为buffer写入本地文件
  streamToBuffer(transformer).then(function(newPicBuffer) {
    fs.writeFile(`${__dirname}/static/云雾缭绕2.png`, newPicBuffer, function(
      err
    ) {
      if (err) {
        console.log(err)
      }
      console.log('done')
    })
  })
}
// dealWithStream(basePicture);

/**
 * 4、将文件的转为JPEG，并对JPEG文件进行处理
 * @param {String} basePicture 源文件路径
 */
function dealWithBuffer(basePicture) {
  sharp(basePicture)
    .resize(300, 300, {
      fit: sharp.fit.inside,
      withoutEnlargement: true
    })
    .toFormat('jpeg')
    .toBuffer()
    .then(function(outputBuffer) {
      fs.writeFile(`${__dirname}/static/云雾缭绕3.jpeg`, outputBuffer, function(
        err
      ) {
        if (err) {
          console.log(err)
        }
        console.log('done')
      })
    })
}
// dealWithBuffer(basePicture)

/**
 * 5、添加水印
 * @param  {String} basePicture 原图路径
 * @param  {String} watermarkPicture 水印图片路径
 * @param  {String} newFilePath 输出图片路径
 */
function addWatermark(basePicture, watermarkPicture, newFilePath) {
  sharp(basePicture)
    .rotate(180) // 旋转180度
    .composite([
      {
        input: watermarkPicture,
        top: 10,
        left: 10
      }
    ]) // 在左上坐标（10， 10）位置添加水印图片
    .withMetadata() // 在输出图像中包含来自输入图像的所有元数据(EXIF、XMP、IPTC)。
    .webp({
      quality: 90
    }) //使用这些WebP选项来输出图像。
    .toFile(newFilePath)
    .catch(err => {
      console.log(err)
    })
  // 注意水印图片尺寸不能大于原图
}

// addWatermark(
//   basePicture,
//   `${__dirname}/static/水印.png`,
//   `${__dirname}/static/云雾缭绕4.png`
// )


 /**
  * 添加文字，类似添加水印
  * @param {String} basePicture 原图路径
  * @param {Object} font 字体设置
  * @param {String} newFilePath 输出图片路径
  * @param {String} text 待粘贴文字
  * @param {Number} font.fontSize 文字大小
  * @param {String} font.color 文字颜色
  * @param {Number} font.left 文字距图片左边缘距离
  * @param {Number} font.top 文字距图片上边缘距离
  */
function addText(basePicture, font, newFilePath) {
  const { fontSize, text, color, left, top } = font;
  // 同步加载文字转SVG的库
  const textToSvgSync = textToSvg.loadSync(fontPath);
  // 设置文字属性
  const attributes = {
    fill: color
  };
  const options = {
    fontSize,
    anchor: 'top',
    attributes
  };
  // 文字转svg，svg转buffer
  const svgTextBuffer = Buffer.from(textToSvgSync.getSVG(text, options));

  // 添加文字
  sharp(basePicture)
    //  .rotate(180) // 旋转180度
    .composite([
      {
        input: svgTextBuffer,
        top,
        left
      }
    ]) // 在左上坐标（10， 10）位置添加文字
    .withMetadata() // 在输出图像中包含来自输入图像的所有元数据(EXIF、XMP、IPTC)。
    .webp({
      quality: 90
    }) //使用这些WebP选项来输出图像。
    .toFile(newFilePath)
    .catch(err => {
      console.log(err)
    });
}

module.exports = {
  addText,
  addWatermark,
  writeTofile,
  dealWithBuffer,
  dealWithStream
}