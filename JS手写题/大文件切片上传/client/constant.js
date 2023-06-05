export const MSG_MAP = {
  'NO_FILE': '请先选择文件!',
  'NOT_ALLOW_TYPE': '请选择正确的文件格式',
  'UPLOAD_FAIL': '上传失败',
  'UPLOAD_SUCCESS': '上传成功'
}

export const ALLOWED_TYPES = [
  'video/mp4'
]

export const CHUNK_SIZE = 512 * 1024;

const BASE_URL = 'http://localhost:8000/'

export const API = {
  'upload-file': BASE_URL + 'upload-file'
}