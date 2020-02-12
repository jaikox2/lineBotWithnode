const router = require('express').Router();
const serviceIdx = require('../services/index');

router.get('/webhook', (req, res) => {
  const { replyToken } = req.body.events[0];
  const msg = req.body.events[0].message.text;
  serviceIdx.replyWebhook(replyToken, msg);
  res.status(200).send('webhook');
});

module.exports = router;
