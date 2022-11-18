const uploader = document.getElementById('uploader')
const output = document.getElementById('output')
const progress = document.getElementById('progress')
// 读文件
async function read(file) {
  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = function () {
      resolve(reader.result)
    }
    reader.onerror = reject
    reader.readAsBinaryString(file)
  })
}

uploader.addEventListener('change', async (event) => {
  console.log('event.target', event.target)
  const { files } = event.target
  // 取出上传的文件
  const [file] = files
  if (!file) return
  // 防止下一次没有change
  uploader.value = null

  const content = await read(file)
  console.log('content', content)
  const hash = CryptoJS.MD5(content)
  console.log('hash', hash)
  const { size, name, type } = file
  // 给进度条最大值为文件大小
  progress.max = size
  // 分片大小
  const chunkSize = 64 * 1024
  // 以及上传多少
  let uploaded = 0
  // 本地记录上传多少
  const local = localStorage.getItem(hash)
  if (local) {
    // 如果有就标记为上传的量
    uploaded = Number(local)
  }

  while (uploaded < size) {
    // 分割文件
    const chunk = file.slice(uploaded, uploaded + chunkSize, type)
    // 创建formdate
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
