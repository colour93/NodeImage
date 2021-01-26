// app.js 入口文件
const sharpapp = require('./sharp')
const { clog } = require('./console-log')

// 源文件路径
const basePicture = './1.jpg'

// 生成文件路径
const distPicture = './2.jpg'

sharpapp.addText(basePicture,{
    fontSize: 24,
    text: '测试',
    color: 'black',
    left: 0,
    top: 0
},distPicture)