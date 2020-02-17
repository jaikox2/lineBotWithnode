const router = require('express').Router();
const serviceIdx = require('../services/index');

router.post('/webhook', (req, res) => {
  serviceIdx.replyWebhook(req.body);
  res.status(200).send('webhook');
});

router.get('/images/menu/:size', (req, res) => {
  const { size } = req.params;
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

module.exports = router;
