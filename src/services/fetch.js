const { URLSearchParams } = require('url');
const fetch = require('node-fetch');
const cron = require('node-cron');

const clientId = process.env.clientId || '1603277440';
const clientSecret = process.env.clientSecret || '47220ade1dbc2db027f18ba969eac75c';

function fetchAccessToken() {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    fetch('https://api.line.me/v2/oauth/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    }).then((response) => {
      resolve(response.json());
    }).catch((error) => {
      reject(error);
    });
  });
}

async function fetchInfo(userid) {
  return new Promise((resolve, reject) => {
    fetch(`https://api.line.me/v2/bot/profile/${userid}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer {${process.env.accessToken}}`,
      },
    }).then((res) => res.json()).then((res) => {
      resolve(res);
    }).catch((err) => {
      reject(err);
    });
  });
}

function fetchReplyWebhook(body) {
  return new Promise((resolve, reject) => {
    fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer {${process.env.accessToken}}`,
      },
      body,
    }).then((response) => response.json()).then((data1) => {
      resolve(data1);
    }).catch((error) => {
      reject(error);
    });
  });
}

async function saveToken() {
  try {
    const token = await fetchAccessToken();
    process.env.accessToken = token.access_token;
    return 0;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('fetch access token: ', error);
    return error;
  }
}

cron.schedule('* */480 * * *', () => {
  saveToken();
});
saveToken();

module.exports = {
  fetchInfo,
  fetchAccessToken,
  fetchReplyWebhook,
};
