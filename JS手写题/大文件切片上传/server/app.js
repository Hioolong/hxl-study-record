const express = require('express');
const bodyParser = require('body-parser');
const uploader = require('express-fileupload');
const {
  extname,
  resolve
} = require('path');
const {
  existsSync,
  appendFileSync,
  writeFileSync
} = require('fs')

const PORT = 8000;

const ALLOWED_TYPES = [
  'video/mp4'
]

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(uploader());
app.use('/', express.static('upload_temp'));

app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST,GET');

  next();
})

app.listen(PORT, () => {
  console.log(`server is running on ${ PORT }`)
})

app.post('/upload-file', (req, res) => {
  console.log(req.body);
  const { type, size, uploadedSize, name, fileName } = req.body;
  const { file } = req.files;

  if (!file) {
    res.send({
      code: 1001,
      msg: 'no file uploaded'
    });
    return;
  }

  if (!ALLOWED_TYPES.includes(type)) {
    res.send({
      code: 1002,
      msg: 'Not allow type'
    });
    return;
  }

  const filename = fileName + extname(name);
  const filePath = resolve(__dirname, './upload_temp/' + filename);

  if (uploadedSize !== '0') {
    if (!existsSync(filePath)) {
      res.send({
        code: 1003,
        msg: 'no file exist'
      });
      return;
    }
    
    appendFileSync(filePath, file.data);

    res.send({
      code: 0,
      msg: 'Appended',
      file_url: 'http://localhost:8000/' + filename
    });
    return;
  }

  writeFileSync(filePath, file.data);

  res.send({
    code: 0,
    msg: 'File is created'
  });
})