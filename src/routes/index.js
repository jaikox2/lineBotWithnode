const router = require('express').Router();
const serviceIdx = require('../services/index');

router.post('/webhook', (req, res) => {
  serviceIdx.replyWebhook(req.body);
  res.status(200).send('webhook');
});

router.get('/images/menu/1040', (req, res) => {
  res.download('./src/public/images/linerichmenu.jpg');
});

module.exports = router;
