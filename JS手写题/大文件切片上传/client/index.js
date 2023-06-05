import {
  MSG_MAP,
  ALLOWED_TYPES,
  CHUNK_SIZE,
  API
} from './constant'

;((doc) => {
  const oFileInput = document.querySelector('#fileInput');
  const oSubmitBtn = document.querySelector('#submitBtn');
  const oProgress = document.querySelector('#progress');
  const oTips = document.querySelector('.tips');

  // 已上传尺寸
  let uploadedSize = 0;
  // 上传后的文件url
  let uploadedRes = null;

  function init() {
    bindEvent();
  }

  function bindEvent() {
    oSubmitBtn.addEventListener('click', handleSubmit, false);
  }

  async function handleSubmit() {
    const { files: [ file ] } = oFileInput;

    if (!ALLOWED_TYPES.includes(file.type)) {
      showTips('NOT_ALLOW_TYPE');
      oFileInput.value = ''
      return;
    }

    if (!file) {
      showTips('NO_FILE');
      return;
    }
    console.log(file);
    const { name, type, size } = file;
    const fileName = `${Date.now()}-${name}`
    oProgress.max = size;
    oTips.innerText = '';

    while(uploadedSize < size) {
      const fileChunk = file.slice(uploadedSize, uploadedSize + CHUNK_SIZE);
      const formData = createFileFormData({
        type,
        size,
        uploadedSize,
        name,
        fileName,
        file: fileChunk
      })

      try {
        uploadedRes = await axios.post(API['upload-file'], formData)
        console.log(uploadedRes);
      } catch (error) {
        showTips('UPLOAD_FAIL', error);
        return;
      }

      uploadedSize += fileChunk.size;
      oProgress.value = uploadedSize;
      
    }

    showTips('UPLOAD_SUCCESS');
    oFileInput.value = null;

    const { data: { file_url } } = uploadedRes;
    createVideo(file_url)
  }

  function createVideo(url) {
    const video = document.createElement('video');
    video.controls = true;
    video.src = url;
    video.width = '600'
    
    document.body.appendChild(video);
  }

  function createFileFormData(params) {
    const { type, size, uploadedSize, name, fileName, file } = params;
    const fd = new FormData();
    fd.append('type', type);
    fd.append('size', size);
    fd.append('uploadedSize', uploadedSize);
    fd.append('name', name);
    fd.append('fileName', fileName);
    fd.append('file', file);

    return fd;
  }

  function showTips(type, otherText = '') {
    const text = MSG_MAP[type];
    if (text) {
      oTips.innerText = text + otherText;
    }
  }

  init();

})(document);