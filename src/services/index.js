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
    baseUrl: 'https://chatbot.isaactech-projects.com/api/images/menuImage',
    altText: 'test update',
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

async function caseReply(key, userId) {
  const info = await getInfo(userId);
  switch (key) {
    case 'สวัสดีครับ':
      return {
        type: 'text',
        text: `สวัสดีครับคุณ ${info.displayName} ต้องการให้เราช่วยอะไรไหมครับ หากมีพิมพ์ "เมนู"`,
        quickReply: {
          items: [
            {
              type: 'action',
              action: {
                type: 'message',
                label: 'เมนู',
                text: 'เมนู',
              },
            },
            {
              type: 'action',
              action: {
                type: 'message',
                label: 'ยอดเงินชราภาพ',
                text: 'ยอดเงินชราภาพ',
              },
            },
            {
              type: 'action',
              action: {
                type: 'message',
                label: 'ขอบคุณครับ',
                text: 'ขอบคุณครับ',
              },
            },
          ],
        },
      };
    case 'ยอดเงินชราภาพ':
      return {
        type: 'text',
        text: `ยอดเงินสมทบชราภาพของคุณ ${info.displayName} รวม 10,000 บาท`,
      };
    case 'ขอบคุณครับ':
      return {
        type: 'text',
        text: 'ด้วยความยินดีครับ',
      };
    case 'เมนู':
      return testImagemap();
    default:
      return {
        type: 'text',
        text: `ขอโทษนะครับ ผมไม่เข้าใจที่คุณ ${info.displayName} พิมพ์หากต้องการให้ทางผมช่วยกรุณาพิมพ์ "เมนู"`,
      };
  }
}

async function replyWebhook(data) {
  const { replyToken } = data.events[0];
  const body = JSON.stringify({
    replyToken,
    messages: [await caseReply(data.events[0].message.text, data.events[0].source.userId)],
  });
  fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // eslint-disable-next-line quote-props
      'Authorization': `Bearer {${accessToken}}`,
    },
    body,
  }).then((response) => response.json()).then((data1) => {
    // eslint-disable-next-line no-console
    console.log(data1);
  }).catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
  });
}

async function caseKiosReply(key, userId) {
  const info = await getInfo(userId);
  switch (key) {
    case 'สวัสดีครับ':
    case 'สวัสดีค่ะ':
      return {
        type: 'text',
        text: `สวัสดีครับคุณ ${info.displayName}`,
      };
    case 'ขอบคุณครับ':
    case 'ขอบคุณค่ะ':
      return {
        type: 'text',
        text: 'ด้วยความยินดีครับ',
      };
    default:
      return {
        type: 'text',
        text: `ขอโทษนะครับ ผมไม่เข้าใจที่คุณ ${info.displayName} พิมพ์หากต้องการให้ทางผมช่วยกรุณา ติดต่อเจ้าหน้าที่ครับ`,
      };
  }
}

async function replyKiosWebhook(data) {
  const { replyToken } = data.events[0];
  const accessTokenKios = '2H5rg35J9wbx1affAZK80EUKgPsFtWmplWFhinTy581fPQm3Qf6/7ADelnhDOEp3czdWxnyrIzfNwq++H1EdYBYbpTDBat5dI86a+puIa3QazTUE2cAV46gFHkFefqSF9gDpPkBdrtVXCO62fh0GJQdB04t89/1O/w1cDnyilFU=';
  const body = JSON.stringify({
    replyToken,
    messages: [await caseKiosReply(data.events[0].message.text, data.events[0].source.userId)],
  });
  fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // eslint-disable-next-line quote-props
      'Authorization': `Bearer {${accessTokenKios}}`,
    },
    body,
  }).then((response) => response.json()).then((data1) => {
    // eslint-disable-next-line no-console
    console.log(data1);
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
  replyKiosWebhook,
};
