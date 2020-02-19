const router = require('express').Router();
const { promisify } = require('util');
const sizeOf = promisify(require('image-size'));
const serviceIdx = require('../services/index');

router.post('/webhook', (req, res) => {
  serviceIdx.replyWebhook(req.body);
  res.status(200).send('webhook');
});

router.post('/kios/image/webhook', (req, res) => {
  serviceIdx.replyKiosWebhook(req.body);
  res.status(200).send('webhook');
});

router.get('/images/menuImage/:size', (req, res) => {
  const { size } = req.params;
  // eslint-disable-next-line no-console
  console.log(req, 'req');
  switch (size) {
    case '240':
      return res.download('./src/public/images/menu/240.jpg');
    case '300':
      return res.download('./src/public/images/menu/300.jpg');
    case '640':
      return res.download('./src/public/images/menu/640.jpg');
    case '700':
      return res.download('./src/public/images/menu/700.jpg');
    case '1040':
      return res.download('./src/public/images/menu/1041.jpg');
    default:
      return res.download('./src/public/images/menu/300.jpg');
  }
});

router.get('/images/originalContentUrl/:name', async (req, res) => {
  const { name } = req.params;
  const path = `./src/public/images/${name}`;
  const dimensions = await sizeOf(path);
  if (dimensions.width < 4096) {
    res.download(path);
  } else {
    const imgBuf = serviceIdx.resizeImage(4096, path);
    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `attachment; filename=${name}`,
      'Accept-Ranges': 'bytes',
    });
    res.send(imgBuf);
  }
});

router.get('/images/previewImageUrl/:name', (req, res) => {
  const { name } = req.params;
  const path = `./src/public/images/${name}`;
  const imgBuf = serviceIdx.resizeImage(240, path);
  res.set({
    'Content-Type': 'image/jpeg',
    'Content-Disposition': `attachment; filename=${name}`,
    'Accept-Ranges': 'bytes',
  });
  return res.send(imgBuf);
});

module.exports = router;
