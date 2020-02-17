const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

const accessToken = process.env.accessToken || 'CjV739v0O6bot9hFT8V4hyPyYnRZ7z/HgTh3+80m6Hw7NG2GT1hA7dHD/+C4SZvZ+T53vr2gR5BdVTrou/xfjDJOTMhOEQHi6XcdwhO6NH8G8bh1Gn546q8e+8Ke2H36JYSjA0Gkp7bXm5HV2br2PQdB04t89/1O/w1cDnyilFU=';
const clientId = process.env.clientId || '1603277440';
const clientSecret = process.env.clientSecret || '47220ade1dbc2db027f18ba969eac75c';

async function getInfo(userid) {
  try {
    const reponse = await fetch(`https://api.line.me/v2/bot/profile/${userid}`, {
      method: 'GET',
      headers: {
        // eslint-disable-next-line quote-props
        'Authorization': `Bearer {${accessToken}}`,
      },
    });
    return reponse.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return error;
  }
}

function testImagemap() {
  return {
    type: 'imagemap',
    baseUrl: 'https://chatbot.isaactech-projects.com/api/images/menu/1040',
    altText: 'This is an imagemap',
    baseSize: {
      width: 1040,
      height: 701,
    },
    actions: [
      {
        type: 'message',
        area: {
          x: 56,
          y: 373,
          width: 435,
          height: 280,
        },
        text: 'เช็คสถานะ',
      },
      {
        type: 'message',
        area: {
          x: 63,
          y: 63,
          width: 430,
          height: 261,
        },
        text: 'เปลี่ยนชื่อ',
      },
      {
        type: 'message',
        area: {
          x: 539,
          y: 62,
          width: 471,
          height: 260,
        },
        text: 'เปลี่ยนโรงพยาบาล',
      },
      {
        type: 'message',
        area: {
          x: 527,
          y: 377,
          width: 486,
          height: 274,
        },
        text: 'ยอดเงินชราภาพ',
      },
    ],
  };
}

async function replyWebhook(data) {
  const { replyToken } = data.events[0];
  const msg = data.events[0].message.text;
  const info = await getInfo(data.events[0].source.userId);
  const body = JSON.stringify({
    replyToken,
    messages: [{
      type: 'text',
      text: `Hello ${info.displayName}`,
    }, {
      type: 'text',
      text: `your user id ${info.userId}`,
    },
    testImagemap()],
  });
  fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // eslint-disable-next-line quote-props
      'Authorization': `Bearer {${accessToken}}`,
    },
    body,
  }).then((response) => {
    return response.json();
  }).then((data) => {
    console.log(data);
  }).catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
  });
}

function getAccessToken() {
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

module.exports = {
  replyWebhook,
  getAccessToken,
};
