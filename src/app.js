const express = require('express');
const bodyParser = require('body-parser');
const routeIdx = require('./routes/index');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api', routeIdx);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`server run on ${port}`);
});
