/**
 * 1. 监听 change 事件拿到 file 对象
 * 2. 判断文件类型是否合法
 * 3. 通过 FileReader 读取 file 对象，生成 base64 格式
 * 4. 通过 base64 展示原始图片
 * 5. 展示后可拿到图片宽高，然后根据宽高创建 canvas ，通过 canvas 来进行压缩处理
 * 6. 压缩后调用 canvas 的 api 生成 base64，渲染到页面中
 */

const originalImg = document.querySelector('#originalImg');
const compressImg = document.querySelector('#compressImg');
const fileInput = document.querySelector('#fileInput');

const IMG_TYPES = {
  'image/jpeg': 'image/jpeg',
  'image/png': 'image/png',
  'image/gif': 'image/gif'
}

const reader = new FileReader()

let imgFile;
let quality = 10;
let compressImgUrl = '';

function init() {
  bindEvent()
}

function bindEvent() {
  fileInput.addEventListener('change', handleFileInputChange, false);
}

function handleFileInputChange(e) {
  imgFile = e.target.files[0]

  if (!imgFile || !IMG_TYPES[imgFile.type]) {
    alert('请选择图片');
    setImgFileEmpty();
    return;
  }
  
  setImgPreview(imgFile);
}

function setImgPreview(imgFile) {
  if (imgFile instanceof File) {
    reader.onload = async () => {
      const originalImgSrc = reader.result;
      await createCompressImage({
        imgSrc: originalImgSrc,
        type: imgFile.type
      })
      originalImg.src = originalImgSrc;
      compressImg.src = compressImgUrl;
      setPreviewVisible(originalImg, true)
      setPreviewVisible(compressImg, true)
      
      
      console.log(compressImgUrl.length, originalImgSrc.length, quality);
    }
    reader.readAsDataURL(imgFile)
  }
}

function createCompressImage({
  imgSrc,
  type,
}) {

  const canvas = document.createElement('canvas');
  const img = document.createElement('img');
  const context = canvas.getContext('2d');
  img.src = imgSrc;
  return new Promise((resolve, reject) => {
    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;
      
      canvas.width = imgWidth;
      canvas.height = imgHeight;
      context.drawImage(img, 0, 0, imgWidth, imgHeight);
  
      doCompress(canvas, imgSrc, type)
      resolve(compressImgUrl)
    }
  })
}

function doCompress(canvas, imgSrc, type) {
  compressImgUrl = canvas.toDataURL(type, quality / 100)

  if (compressImgUrl.length >= imgSrc.length && quality > 10) {
    quality -= 10;
    doCompress(canvas, imgSrc, type)
  }
}

function setImgFileEmpty() {
  fileInput.value = '';
  imgFile = null;
  setPreviewVisible(originalImg, false);
  setPreviewVisible(compressImg, false);
}

function setPreviewVisible(node, visible) {
  switch (visible) {
    case true:
      node.classList.add('show')
      node.classList.remove('hide')
      break;
    case false:
      node.classList.add('hide')
      node.classList.remove('show')
      break;
    default:
      break;
  }
}

init();