const express = require('express')
const qrcode = require('qrcode-terminal');
const bodyParser = require('body-parser');
const { Client,MessageMedia,LocalAuth } = require('whatsapp-web.js');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//comment start//
const client = new Client({
authStrategy: new LocalAuth({
    clientId: "lamrod-whatsapp-sender",
    dataPath: ".wwebjs_auth2"
}),
puppeteer: { 
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--unhandled-rejections=strict'
    ]},
});

client.on('qr', qr => {
  console.log(qr);
  qrcode.generate(qr, {large: true});
});

client.on('authenticated', (object) => {
  console.log('AUTHENTICATED');
  
});

client.on('auth_failure', msg => {
  // Fired if session restore was unsuccessful
  console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('Client is ready!');
    const number = "919610417000";
    console.log('sending....');

    // Your message.
    const text = "hello new";

    // Getting chatId from the number.
    // we have to delete "+" from the beginning and add "@c.us" at the end of the number.
    const chatId = number + "@c.us";

    // Sending message.
    client.sendMessage(chatId, text);
    setTimeout(() => client.destroy(), 1000);
});

client.initialize();

//comment end


// function sendMessage(number, message) {
//     console.log('i am being called: ', number, message);

//     const client2 = new Client({
//       authStrategy: new LocalAuth({
//         clientId: "lamrod-whatsapp-sender",
//         dataPath: ".wwebjs_auth2"
//     }),
//     puppeteer: { 
//           headless: true,
//           args: [
//             '--no-sandbox',
//             '--disable-setuid-sandbox',
//             '--unhandled-rejections=strict'
//         ]},
//     });

//     client2.on('authenticated', () => {
//         console.log('AUTHENTICATED');
//     });
    
//     client2.on('auth_failure', msg => {
//     // Fired if session restore was unsuccessful
//     console.error('AUTHENTICATION FAILURE', msg);
//     });

//     client2.on('ready', () => {
//       console.log('Im Ready now');
//         const chatId = '91'+ number + "@c.us";
//         console.log(chatId, message);
//         client2.sendMessage(chatId, message);
//         setTimeout(() => client2.destroy(), 10000);
//         console.log('sent');

//     });

//     client2.initialize();
// }

const sendMessages = async (messages) => {
  console.log('I can send These messages = ', messages);


  const client2 = new Client({
    authStrategy: new LocalAuth({
      clientId: "lamrod-whatsapp-sender",
      dataPath: ".wwebjs_auth2"
  }),
  puppeteer: { 
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--unhandled-rejections=strict'
      ]},
  });

//   client2.initialize().catch(_ => _);

  client2.on('disconnected', () => console.log('I am disconnected'))
  client2.on('authenticated', (object) => {
    console.log('AUTHENTICATED');
    
  });
  
  client2.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
  });
  client2.on('ready', async () => {

    console.log('im ready Now');

    async function asyncSubProcessing(item) {  
      await new Promise(async resolve => {
        if (item.isMedia) {
          const media = await MessageMedia.fromUrl(item.fileurl);
          media.filename = item.filename;
          item.message = media;
        }
        const chatId = '91'+ item.number + "@c.us";
        console.log(chatId, item.message);
        await client2.sendMessage(chatId, item.message);
        setTimeout(() => resolve(), 40000);
      });
      return item;
    }

    const promises = [];
    for (const message of messages) promises.push(await asyncSubProcessing(message));
    await Promise.all(promises);
    
    //setTimeout(() => client.destroy(), 1000);
    client2.destroy();

    return console.log('sent');
    
  });
  client2.initialize();
  
}


// ///i can do anything


// const messages = [
//   {number: '919887981988', message: 'hello 1'},
//   {number: '919610417000', message: 'hello 1'}
// ];

//sendMessages(messages);


// app.use('/', async (req, res, next) => {
//   console.log('i will send message');
//   const number = req.query.number;
//   const message = req.query.message;
//   console.log(number);
//   sendMessage(number, message);
//   return res.json({ sent: true });
// });

app.use('/', async (req, res, next) => {
  console.log('i will send message');
  const messages = req.body;
  console.log('I can send These body = ', req.body);
  sendMessages(messages);
  return res.json({ sent: true });
});


const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log('whatsapp webapp listening on port !'+port);
});

module.exports = app;