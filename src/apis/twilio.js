const twilio = require('twilio');
require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

async function sendWhatsAppMessage(to, message) {

    client.messages
        .create({
            from: 'whatsapp:+14155238886',
            to: `whatsapp:${to}`,
            body: message
        })
        .then(message => console.log(message.sid))
        .catch(error => console.error('Error:', error));
}

module.exports = {
    sendWhatsAppMessage
};