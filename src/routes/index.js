const router = require('express').Router();
const serviceIdx = require('../services/index');

router.post('/webhook', (req, res) => {
  serviceIdx.replyWebhook(req.body);
  res.status(200).send('webhook');
});

module.exports = router;
