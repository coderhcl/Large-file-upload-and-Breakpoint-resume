const express = require('express')
const { extname, resolve } = require('path')
const {
  promises: { writeFile, appendFile },
  existsSync,
} = require('fs')
// 处理文件上传
const uploader = require('express-fileupload')
const app = express()
const post = 8888
// 设置静态文件
app.use('/', express.static('public'))
// 通过 express.json() 这个中间件，解析表单中的 JSON 格式的数据
app.use(express.json())
// 通过 express.urlencoded() 这个中间件，来解析表单中的 url-encoded 格式的数据
app.use(
  express.urlencoded({
    urlencoded: true,
  }),
)
app.use(uploader())

app.post('/api/upload', async (req, res) => {
  const { name, size, type, offset, hash } = req.body
  // express-fileupload
  const { file } = req.files

  // 扩展名
  const ext = extname(name)
  // 文件名
  const filename = resolve(__dirname, `./public/${hash}${ext}`)

  if (offset > 0) {
    if (!existsSync(filename)) {
      res.status(400).send({
        message: '文件不存在',
      })
      return
    }
    // file.data <Buffer 00 00 00 20 66 74 79 70  ... 65486 more bytes>
    await appendFile(filename, file.data)
    res.send({
      message: 'appended',
    })
    return
  }

  await writeFile(filename, file.data)
  res.send({
    message: 'created',
  })
  return
})

app.listen(post, () => {
  console.log('server is running at', post)
})
