const accessToken = process.env.accessToken || 'NrkNVLQYgwL0kDGEFIjulNQ5hmHGak8hzEvfpcTnP0pXoZDAq0ByR8XBekWdCe+t+T53vr2gR5BdVTrou/xfjDJOTMhOEQHi6XcdwhO6NH+PXgJqKRz/gghqMS1DM+CFSUOIziUP+nVM8l0xGN/k/QdB04t89/1O/w1cDnyilFU=';

async function replyWebhook(replyToken, msg) {
  const body = JSON.stringify({
    replyToken,
    messages: [{
      type: 'text',
      text: msg,
    }],
  });
  // eslint-disable-next-line no-undef
  fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // eslint-disable-next-line quote-props
      'Authorization': `Bearer {${accessToken}}`,
    },
    body,
  }).catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
  });
}

module.exports = {
  replyWebhook,
};
