const uploader = document.getElementById('uploader')
const output = document.getElementById('output')
const progress = document.getElementById('progress')
// 读文件
async function read(file) {
  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    // 处理load事件。该事件在读取操作完成时触发。
    reader.onload = function () {
      resolve(reader.result)
    }
    // 该事件在读取操作发生错误时触发
    reader.onerror = reject
    // 开始读取指定的内容，一旦完成，result属性中将包含所读取文件的原始二进制数据。
    reader.readAsBinaryString(file)
  })
}

uploader.addEventListener('change', async (event) => {
  const { files } = event.target
  // 取出上传的文件
  const [file] = files
  // 没有上传直接return
  if (!file) return

  // 防止下一次没有change
  uploader.value = null
  // content 为文件的原始二进制数据
  const content = await read(file)
  // 以文件的md5码作为文件的唯一标识
  const hash = CryptoJS.MD5(content)

  const { size, name, type } = file
  // 给进度条最大值为文件大小
  progress.max = size
  // 分片大小
  const chunkSize = 64 * 1024
  // 上传量，初始值为 0
  let uploaded = 0
  // 本地记录上次的上传量
  const local = localStorage.getItem(hash)
  if (local) {
    // 如果有就标记为上传的量
    uploaded = Number(local)
  }

  // let breakpoint = 7500 * 1024

  while (uploaded < size) {
    // 分割文件 第一个参数表示文件起始读取Byte字节  第二个参数则是结束读取字节。第三参数为类型
    const chunk = file.slice(uploaded, uploaded + chunkSize, type)
    // 创建formdate  https://developer.mozilla.org/zh-CN/docs/Web/API/FormData
    const formData = new FormData()
    formData.append('name', name)
    formData.append('type', type)
    formData.append('size', size)
    formData.append('file', chunk)
    formData.append('hash', hash)
    // 文件上传容量多少（位置）
    formData.append('offset', uploaded)

    try {
      await axios.post('/api/upload', formData)
    } catch (e) {
      output.innerText = '上传失败' + e.message
      return
    }

    uploaded += chunk.size
    localStorage.setItem(hash, uploaded)
    progress.value = uploaded
  }

  output.innerText = '上传成功'
})
