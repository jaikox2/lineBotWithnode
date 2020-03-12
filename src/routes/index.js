const router = require('express').Router();
const { promisify } = require('util');
const sizeOf = promisify(require('image-size'));
const moment = require('moment');
const serviceIdx = require('../services/index');
const serviceFacebook = require('../services/facebook');
const {
  insertUsers,
  queryUsers,
  updateLogout,
} = require('../services/pgFetch');
const {
  fetchRegister,
  fetchMoneySavingLists,
} = require('../services/fetch');


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

router.get('/images/menuImages/:size', async (req, res, next) => {
  const { size } = req.params;
  const path = './src/public/images/menu/menu.png';
  // eslint-disable-next-line no-console
  console.log(req, 'req');
  try {
    let imgBuf;
    switch (size) {
      case '240':
        imgBuf = await serviceIdx.resizeImage(240, path);
        break;
      case '300':
        imgBuf = await serviceIdx.resizeImage(300, path);
        break;
      case '640':
        imgBuf = await serviceIdx.resizeImage(640, path);
        break;
      case '700':
        imgBuf = await serviceIdx.resizeImage(700, path);
        break;
      case '1040':
        imgBuf = await serviceIdx.resizeImage(1040, path);
        break;
      default:
        imgBuf = await serviceIdx.resizeImage(300, path);
    }
    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `attachment; filename=${size}.png`,
      'Accept-Ranges': 'bytes',
    });
    res.send(imgBuf);
  } catch (error) {
    error.status = 500;
    next(error);
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

router.post('/liff/sso/verified', async (req, res, next) => {
  const request = req.body;
  try {
    if (request.lineId && request.personalId && request.name
    && request.lastname && request.dob && request.phone) {
      // connect with sso

      if (moment(request.dob, 'YYYYMMDD').isValid()) {
        const body = {
          name: request.name,
          surname: request.lastname,
          dob: request.dob,
          nid: request.personalId,
          phone: request.phone,
        };

        const result = await fetchRegister(body);

        if (result.error) {
          const err = new Error(result.msg);
          next(err);
        } else {
          res.status(200).send({
            code: 200,
            message: 'success',
          });
        }
      } else {
        const err = new Error('require date format invalid only (YYYYmmdd)');
        next(err);
      }
    } else {
      const err = new Error('require invalid');
      next(err);
    }
  } catch (error) {
    error.status = 500;
    next(error);
  }
});

router.post('/liff/otp/verified', async (req, res, next) => {
  const request = req.body;
  try {
    if (request.lineId && request.personalId && request.name
    && request.lastname && request.dob && request.phone) {
      if (request.OTP === '12345') {
        await insertUsers(request.lineId, request.personalId, request.name,
          request.lastname, request.dob, request.phone);

        res.status(200).send({
          code: 200,
          message: 'success',
        });
      } else {
        const err = new Error('OTP invalid');
        next(err);
      }
    } else {
      const err = new Error('require invalid');
      next(err);
    }
  } catch (error) {
    error.status = 500;
    next(error);
  }
});

router.post('/liff/login/verified', async (req, res, next) => {
  const request = req.body;
  try {
    if (request.lineId) {
      const users = await queryUsers(request.lineId);

      if (users.rows.length > 0) {
        if (users.rows[0].islogin) {
          res.status(200).send({
            code: 200,
            message: 'success',
          });
        } else {
          res.status(401).send({
            code: 401,
            message: 'login fail',
          });
        }
      } else {
        res.status(401).send({
          code: 401,
          message: 'login fail',
        });
      }
    } else {
      const err = new Error('require invalid');
      next(err);
    }
  } catch (error) {
    error.status = 500;
    next(error);
  }
});

router.post('/liff/logout', (req, res, next) => {
  const request = req.body;
  try {
    if (request.lineId) {
      updateLogout(request.lineId);
      res.status(200).send({
        code: 200,
        message: 'success',
      });
    } else {
      const err = new Error('require invalid');
      next(err);
    }
  } catch (error) {
    error.status = 500;
    next(error);
  }
});

router.post('/liff/sso/saving/lists', async (req, res, next) => {
  const request = req.body;
  try {
    if (request.lineId) {
      const users = await queryUsers(request.lineId);
      if (users.rows.length > 0) {
        const body = {
          nid: users.rows[0].personalId,
          list_type: 'year',
        };

        const lists = await fetchMoneySavingLists(body);

        if (lists.error) {
          const err = new Error(lists.msg);
          next(err);
        } else {
          res.status(200).send({
            code: 200,
            message: 'success',
            data: lists.list,
          });
        }
      } else {
        const err = new Error('can not found this {lineId}');
        next(err);
      }
    } else {
      const err = new Error('require invalid');
      next(err);
    }
  } catch (error) {
    error.status = 500;
    next(error);
  }
});

module.exports = router;
