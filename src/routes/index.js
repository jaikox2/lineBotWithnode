const router = require('express').Router();
const { promisify } = require('util');
const sizeOf = promisify(require('image-size'));
const serviceIdx = require('../services/index');
const serviceFacebook = require('../services/facebook');

router.post('/webhook', (req, res) => {
  serviceIdx.replyWebhook(req.body);
  res.status(200).send('webhook');
});

router.post('/facebook/webhook', (req, res) => {
  const { body } = req;
  if (body.object === 'page') {
    body.entry.forEach((entry) => {
      const webhookEvent = entry.messaging[0];

      if (webhookEvent.message) {
        serviceFacebook.handleMessage(webhookEvent.sender.id, webhookEvent.message);
      } else if (webhookEvent.postback) {
        serviceFacebook.handlePostback(webhookEvent.sender.id, webhookEvent.postback);
      }
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

router.get('/facebook/webhook', (req, res) => {
  const VERIFY_TOKEN = '06dec4024a1c9b785af9f9517784d9cb263b0bc57b688b9d02c3398d1082977d';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // eslint-disable-next-line no-console
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }
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

router.get('/images/originalContentUrl/:name', async (req, res, next) => {
  const { name } = req.params;
  const path = `./src/public/images/${name}`;
  try {
    const dimensions = await sizeOf(path);
    if (dimensions.width < 4096) {
      res.download(path);
    } else {
      const imgBuf = await serviceIdx.resizeImage(4096, path);
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename=${name}`,
        'Accept-Ranges': 'bytes',
      });
      res.send(imgBuf);
    }
  } catch (error) {
    next(error);
  }
});

router.get('/images/previewImageUrl/:name', async (req, res, next) => {
  const { name } = req.params;
  const path = `./src/public/images/${name}`;
  try {
    const imgBuf = await serviceIdx.resizeImage(240, path);
    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `attachment; filename=${name}`,
      'Accept-Ranges': 'bytes',
    });
    res.send(imgBuf);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
