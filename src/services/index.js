const { promisify } = require('util');
const sizeOf = promisify(require('image-size'));
const fs = require('fs');
const resizeImg = require('resize-img');

const {
  fetchInfo,
  fetchReplyWebhook,
} = require('./fetch');

const quickReply = {
  items: [
    {
      type: 'action',
      action: {
        type: 'message',
        label: 'โรงพยาบาลปัจจุบัน',
        text: 'โรงพยาบาลปัจจุบัน',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: 'หน่วยงานรับผิดชอบ',
        text: 'หน่วยงานที่รับผิดชอบ',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: 'ยอดเงินชราภาพคงเหลือ',
        text: 'ยอดเงินสมทบชราภาพคงเหลือ',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: 'สิทธิฯรายปีคงเหลือ',
        text: 'สิทธิฯรายปีคงเหลือ',
      },
    },
  ],
};

function calculateImageSizeAutoHeight(originWidth, originHeight, futureWidth) {
  const percentage = parseInt(futureWidth, 10) / parseInt(originWidth, 10);
  const futureHeight = parseInt(originHeight, 10) * parseFloat(percentage);
  return Math.round(futureHeight);
}

async function resizeImage(width, path) {
  try {
    const dimensions = await sizeOf(path);
    const autoHeight = calculateImageSizeAutoHeight(dimensions.width, dimensions.height, width);
    const imageBuf = await resizeImg(fs.readFileSync(path), {
      width,
      height: autoHeight,
    });
    return imageBuf;
  } catch (error) {
    return error;
  }
}

function testImagemap() {
  return [{
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
  }];
}

function caseReply(key, info) {
  switch (true) {
    case (key.indexOf('สวัสดีครับ') !== -1):
    case (key.indexOf('สวัสดีค่ะ') !== -1):
    case (key.indexOf('สวัสดี') !== -1):
      return [{
        type: 'text',
        text: `สวัสดีครับคุณ ${info.displayName} หากคุณยังไม่ได้ลงทะเบียนกรุณาลงทะเบียนก่อนครับ`,
      },
      {
        type: 'text',
        text: 'https://developers.line.me',
        quickReply,
      }];
    case (key.indexOf('โรงพยาบาลปัจจุบัน') !== -1):
      return [{
        type: 'text',
        text: `ประกันสังคมของคุณ ${info.displayName} ลงทะเบียนที่ [โรงพยาบาล]`,
        quickReply,
      }];
    case (key.indexOf('หน่วยงานที่รับผิดชอบ') !== -1):
      return [{
        type: 'text',
        text: 'รับผิดชอบโดยหน่วยงาน สปส',
        quickReply,
      }];
    case (key.indexOf('ยอดเงินสมทบชราภาพคงเหลือ') !== -1):
      return [{
        type: 'text',
        text: `ยอดเงินสมทบชราภาพขอคุณ ${info.displayName} คงเหลือ [1000] บาท`,
        quickReply,
      }];
    case (key.indexOf('สิทธิฯรายปีคงเหลือ') !== -1):
      return [{
        type: 'text',
        text: `ยอดเงินคงเหลือของ ${info.displayName} คงเหลือ [3000] บาท`,
        quickReply,
      }];
    case (key.indexOf('วันหมดอายุประกันสังคม') !== -1):
      return [{
        type: 'text',
        text: `สถานะประกันสังคมของคุณ ${info.displayName} อยู่ในสถานะ [หมดอายุ]`,
        quickReply,
      }];
    case (key.indexOf('วันที่ลงทะเบียนประกัน') !== -1):
      return [{
        type: 'text',
        text: `คุณ ${info.displayName} เข้าระบบประกันเมื่อ [20/02/2015]`,
        quickReply,
      }];
    case (key.indexOf('ขอบคุณครับ') !== -1):
      return [{
        type: 'text',
        text: 'ด้วยความยินดีครับ',
      }];
    case (key.indexOf('เมนู') !== -1):
      return testImagemap();
    default:
      return [{
        type: 'text',
        text: `ขอโทษนะครับ ผมไม่เข้าใจที่คุณ ${info.displayName} พิมพ์หากต้องการให้ทางผมช่วยกรุณาพิมพ์ "เมนู"`,
        quickReply,
      }];
  }
}

async function replyWebhook(data) {
  try {
    const { replyToken } = data.events[0];
    const info = await fetchInfo(data.events[0].source.userId);
    const body = JSON.stringify({
      replyToken,
      messages: caseReply(data.events[0].message.text, info),
    });
    fetchReplyWebhook(body);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('replyWebhook: ', error);
  }
}

module.exports = {
  replyWebhook,
  resizeImage,
};
