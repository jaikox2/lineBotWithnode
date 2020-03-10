const express = require('express');
const bodyParser = require('body-parser');
const routeIdx = require('./routes/index');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api', routeIdx);

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  if (err.status === 500) {
    res.status(500).send({
      code: 500,
      message: 'server error',
    });
  } else {
    next(err);
  }
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).send({
    code: 500,
    message: err.message,
  });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`server run on ${port}`);
});
