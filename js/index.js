window.addEventListener('load', function () {
  const request = axios.create({
    baseURL: 'https://midjourney-api.ai-des.com/func2api',
  })

  // 图片id
  let id = ''
  // 请求数据
  const data = {
    // P表示第一次生成图片，U表示修改生成过的图片
    type: 'P',
    // 提示词
    prompt: '',
    // 如果要修改图片则不能为空
    imgId: "",
    // 如果要修改图片则不能为空，图片编号1-4
    num: 0
  }

  // 文本框输入事件
  document.querySelector('.prompt').addEventListener('change', function () {
    data.prompt = this.value
  })

  // 提交事件
  document.querySelector('.submit').addEventListener('click', makeImg)

  // 底部选择图片按钮点击事件
  const btnImgChecks = document.querySelectorAll('.btn-img-check')
  btnImgChecks.forEach((item, index) => {
    item.addEventListener('click', function () {
      // 再次点击去除激活状态
      if (this.className.includes('active')) {
        this.classList.remove('active')
        data.type = 'P'
        data.imgId = ''
        data.num = 0
        return
      }
      if (document.querySelector('.btn-img-check.active')) {
        document.querySelector('.btn-img-check.active').classList.remove('active')
      }
      this.classList.add('active')
      data.type = 'U'
      data.imgId = id
      data.num = index + 1
    })
  })

  // 生成图片
  async function makeImg() {
    if (data.prompt.trim() === '' && data.type === 'P') {
      showTip('提示词不能为空')
      data.prompt = ''
      document.querySelector('.prompt').value = ''
      return
    } else if (data.prompt.trim() === '' && data.type === 'U') {
      data.prompt = `提取${new Date().getMilliseconds()}`
    }
    const { data: res } = await request.post('/Describe', data, {
      headers: {
        "Content-Type": "application/json",
        "UUID": "afd22831-6e9e-c4e4-2477-825a3328a178"
      },
    })
    if (res.code !== 200) return showTip('试试换个提示词吧')
    const wait = document.querySelector('.wait')
    const submit = document.querySelector('.submit')
    const prompt = document.querySelector('.prompt')
    const image = document.querySelector('.image')
    const download = document.querySelector('.download-a')
    const btnImgCheckBox = document.querySelector('.btn-img-check-box')
    if (btnImgCheckBox.className.includes('show')) fadeIn(btnImgCheckBox)
    image.src = ''
    download.href = ''
    submit.disabled = true
    prompt.disabled = true
    prompt.placeholder = '图片加载中禁止输入'
    data.prompt = ''
    document.querySelector('.prompt').value = ''
    wait.style.opacity = 1
    // 等待1分钟再获取图片
    let num = 60
    let timer = setInterval(() => {
      num--
      if (num === 0) {
        clearInterval(timer)
        wait.style.opacity = 0
        if (data.type === 'U') {
          document.querySelector('.btn-img-check.active').classList.remove('active')
          data.imgId = ''
          data.num = 0
          data.type = 'P'
        } else {
          fadeOut(btnImgCheckBox)
        }
        submit.disabled = false
        prompt.disabled = false
        prompt.placeholder = '请输入提示词'
        getImg({ imgId: res.data.imgId })
      }
    }, 1000)
  }

  // 获取图片
  async function getImg(imgId) {
    const { data: res } = await request.post('/Describe', imgId)
    id = res.data.imgId
    const image = document.querySelector('.image')
    const download = document.querySelector('.download-a')
    image.src = `https://midjourney-api.ai-des.com${res.data.url}`
    download.href = `https://midjourney-api.ai-des.com${res.data.url}`
  }

  // 展示提示
  function showTip(message) {
    const tip = document.querySelector('.tip')
    tip.innerHTML = message
    fadeOut(tip)
    setTimeout(() => {
      fadeIn(tip)
    }, 2000)
  }

  // 淡出动画
  function fadeOut(ele) {
    ele.classList.add('fade-out')
    setTimeout(() => {
      ele.classList.remove('fade-out')
      ele.style.opacity = 1
    }, 500)
  }

  // 淡入动画
  function fadeIn(ele) {
    ele.style.opacity = 0
    ele.classList.add('fade-in')
    setTimeout(() => {
      ele.classList.remove('fade-in')
      ele.style.opacity = 0
    }, 500)
  }
})
