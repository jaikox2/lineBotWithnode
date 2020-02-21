const fetch = require('node-fetch');

const PageAccessToken = process.env.PAGE_ACCESS_TOKEN;


async function callSendAPI(senderPsid, response) {
  try {
    const requestBody = {
      recipient: {
        id: senderPsid,
      },
      message: response,
    };
    const reponse = await fetch('https://graph.facebook.com/v2.6/me/messages', {
      method: 'POST',
      headers: {
        access_token: PageAccessToken,
      },
      body: requestBody,
    });
    return reponse.json();
  } catch (error) {
    return error;
  }
}

function handleMessage(senderPsid, receivedMessage) {
  let response;

  if (receivedMessage.text) {
    response = {
      text: `You sent the message: "${receivedMessage.text}". Now send me an attachment!`,
    };
  } else if (receivedMessage.attachments) {
    const attachmentUrl = receivedMessage.attachments[0].payload.url;
    response = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [{
            title: 'Is this the right picture?',
            subtitle: 'Tap a button to answer.',
            image_url: attachmentUrl,
            buttons: [
              {
                type: 'postback',
                title: 'Yes!',
                payload: 'yes',
              },
              {
                type: 'postback',
                title: 'No!',
                payload: 'no',
              },
            ],
          }],
        },
      },
    };
  }
  callSendAPI(senderPsid, response);
}

// Handles messaging_postbacks events
function handlePostback(senderPsid, receivedPostback) {
  let response;
  const { payload } = receivedPostback;

  if (payload === 'yes') {
    response = { text: 'Thanks!' };
  } else if (payload === 'no') {
    response = { text: 'Oops, try sending another image.' };
  }
  // Send the message to acknowledge the postback
  callSendAPI(senderPsid, response);
}

module.exports = {
  handlePostback,
  handleMessage,
};
