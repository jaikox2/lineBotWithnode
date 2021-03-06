const request = require('request');

const PageAccessToken = process.env.PAGE_ACCESS_TOKEN || 'EAAC1g1P9VZCwBAIXtMlXgAiQhNBMUkrZCvlOaiyBcKpjeizpKPZB79dtNj8NY82XE4ZCUSEtWz9XTqhIrYMxT4EvJNHZBYQ66v4NLWUywu9AJEp6hooN2ZALMCjNHDm73hvRzAJpKI7T44mZBCZAj5o6joOiNFbLDO3jRR2PmfiavZBoITqDMip9m';


async function callSendAPI(senderPsid, response) {
  const requestBody = {
    recipient: {
      id: senderPsid,
    },
    message: response,
  };
  request({
    uri: 'https://graph.facebook.com/v6.0/me/messages',
    qs: {
      access_token: PageAccessToken,
    },
    method: 'POST',
    json: requestBody,
  }, (err) => {
    if (!err) {
      console.log('message sent!');
    } else {
      console.error(`Unable to send message: ${err}`);
    }
  });
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

  callSendAPI(senderPsid, response);
}

module.exports = {
  handlePostback,
  handleMessage,
};
