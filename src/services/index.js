const { promisify } = require('util');
const sizeOf = promisify(require('image-size'));
const fs = require('fs');
const resizeImg = require('resize-img');

const {
  fetchInfo,
  fetchReplyWebhook,
  fetchProfile,
} = require('./fetch');

const {
  queryUsers,
} = require('./pgFetch');

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
        label: 'สิทธิฯทันตกรรมเหลือ',
        text: 'สิทธิฯทันตกรรมเหลือ',
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
    baseUrl: 'https://chatbot.isaactech-projects.com/api/images/menuImages',
    altText: 'change menu',
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
        text: 'วันหมดอายุประกันสังคม',
      },
      {
        type: 'message',
        area: {
          x: 63,
          y: 63,
          width: 430,
          height: 261,
        },
        text: 'วันที่ลงทะเบียนประกัน',
      },
      {
        type: 'uri',
        area: {
          x: 539,
          y: 62,
          width: 471,
          height: 260,
        },
        linkUri: 'https://pantip.com/',
      },
      {
        type: 'uri',
        area: {
          x: 527,
          y: 377,
          width: 486,
          height: 274,
        },
        linkUri: 'https://developers.line.me',
      },
    ],
  }];
}

function caseReply(key, info, profile) {
  switch (true) {
    case (key.indexOf('สวัสดีครับ') !== -1):
    case (key.indexOf('สวัสดีค่ะ') !== -1):
    case (key.indexOf('สวัสดี') !== -1):
      return [{
        type: 'text',
        text: `สวัสดีครับคุณ ${info.displayName} น้อง bot ยินดีให้ความช่วยเหลือครับ`,
        quickReply,
      }];
    case (key.indexOf('โรงพยาบาลปัจจุบัน') !== -1):
      return [{
        type: 'text',
        text: `ประกันสังคมของคุณ ${info.displayName} ลงทะเบียนที่ [${profile.hosp_name}]`,
        quickReply,
      }];
    case (key.indexOf('หน่วยงานที่รับผิดชอบ') !== -1):
      return [{
        type: 'text',
        text: `รับผิดชอบโดยหน่วยงาน ${profile.res_organize}`,
        quickReply,
      }];
    case (key.indexOf('ยอดเงินสมทบชราภาพคงเหลือ') !== -1):
      return [{
        type: 'text',
        text: `ยอดเงินสมทบชราภาพขอคุณ ${info.displayName} คงเหลือ [${profile.total}] บาท`,
        quickReply,
      }];
    case (key.indexOf('สิทธิฯทันตกรรมเหลือ') !== -1):
      return [{
        type: 'text',
        text: `ยอดเงินคงเหลือของ ${info.displayName} คงเหลือ [${profile.dentist}] บาท`,
        quickReply,
      }];
    case (key.indexOf('วันหมดอายุประกันสังคม') !== -1):
      return [{
        type: 'text',
        text: `สถานะประกันสังคมของคุณ ${info.displayName} อยู่ในสถานะ [${profile.status}]`,
        quickReply,
      }];
    case (key.indexOf('วันที่ลงทะเบียนประกัน') !== -1):
      return [{
        type: 'text',
        text: `คุณ ${info.displayName} เข้าระบบประกันเมื่อ [${profile.start}]`,
        quickReply,
      }];
    case (key.indexOf('ขอบคุณครับ') !== -1):
      return [{
        type: 'text',
        text: 'ด้วยความยินดีครับ',
      }];
    case (key.indexOf('ลงทะเบียนแล้วจ้า') !== -1):
      return [{
        type: 'text',
        text: 'เรายินดีให้บริการครับ',
        quickReply,
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
    const users = await queryUsers(data.events[0].source.userId);
    const info = await fetchInfo(data.events[0].source.userId);
    let message;
    if (users.rows.length > 0 && users.rows[0].islogin) {
      const body = {
        nid: users.rows[0].personalid,
      };
      const profile = await fetchProfile(body);
      if (profile.error) {
        message = [{
          type: 'text',
          text: `ไม่พบข้อมูลที่หมาบเลขบัตรประชาชนนี้ ${users.rows[0].personalid}`,
        }];
      } else {
        message = caseReply(data.events[0].message.text, info, profile);
      }
    } else if (data.events[0].message.text.indexOf('ยกเลิกลงทะเบียนแล้วจ้า') !== -1) {
      message = [{
        type: 'text',
        text: 'ขอบคุณที่ใช้บริการเราครับ',
      }];
    } else {
      message = [{
        type: 'text',
        text: `สวัสดีครับคุณ ${info.displayName} คุณยังไม่ได้ลงทะเบียนกรุณาลงทะเบียนก่อนครับ`,
      }];
    }
    const body = JSON.stringify({
      replyToken,
      messages: message,
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
