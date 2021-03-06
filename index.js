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
    clientId: "Testing",
    dataPath: ".wwebjs_auth"
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


client.on('authenticated', () => {
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
    const text = "hello";

    // Getting chatId from the number.
    // we have to delete "+" from the beginning and add "@c.us" at the end of the number.
    const chatId = number + "@c.us";

    // Sending message.
    client.sendMessage(chatId, text);
    console.log('Message sent');
    setTimeout(() => { 
        client.destroy()
        .then(() => console.log('Client Destroyed'))
     }, 20000);
});

client.initialize();

//comment end


function sendMessage(number, message, company) {

  const client = new Client({
    authStrategy: new LocalAuth({
           clientId: company,
           dataPath: ".wwebjs_auth"
       }),
       puppeteer: { 
               headless: true,
               args: [
                 '--no-sandbox',
                 '--disable-setuid-sandbox',
                 '--unhandled-rejections=strict'
            ]},
  });


    client.on('ready', () => {
      console.log('Im Ready now');
        const chatId = '91'+ number + "@c.us";
        console.log(chatId, message);
        client.sendMessage(chatId, message);
        setTimeout(() => { 
            client.destroy()
            .then(() => console.log('Client Destroyed'))
         }, 10000);
        console.log('sent');

    });

    client.initialize();
}

const sendMessages = async (messages, company) => {
  console.log('I can send These messages = ', messages);


  // const client = new Client({
  //   authStrategy: new LocalAuth({
  //     clientId: "example",
  //     dataPath: ".wwebjs_auth"
  // }),
  // puppeteer: { 
  //       headless: false,
  //       args: [
  //         '--no-sandbox',
  //         '--disable-setuid-sandbox',
  //         '--unhandled-rejections=strict'
  //     ]},
  // });

  const client = new Client({
    authStrategy: new LocalAuth({
           clientId: company,
           dataPath: ".wwebjs_auth"
       }),
       puppeteer: { 
               headless: true,
               args: [
                 '--no-sandbox',
                 '--disable-setuid-sandbox',
                 '--unhandled-rejections=strict'
            ]},
  });

  // client.initialize().catch(_ => _);

  client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});


  client.on('ready', async () => {

    console.log('im ready Now');
    //console.log(req.body);
    

    async function asyncSubProcessing(item) {  
      await new Promise(async resolve => {
        if (item.isMedia) {
          const media = await MessageMedia.fromUrl(item.fileurl);
          media.filename = item.filename;
          item.message = media;
        }
        const chatId = '91'+ item.number + "@c.us";
        console.log(chatId, item.message);
        await client.sendMessage(chatId, item.message);

        setTimeout(() => resolve(), 4000);
      });
      return item;
    }

    const promises = [];
    for (const message of messages) promises.push(await asyncSubProcessing(message));
    await Promise.all(promises);
    
    setTimeout(() => { 
        client.destroy()
        .then(() => console.log('Client Destroyed'))
     }, 10000);
    

    return console.log('sent');
  });
  client.initialize();
}


// ///i can do anything

// await client.sendMessage(chatId, item.message)
//             .then((d) => console.log(d.data))
//             .catch(e => console.log(e));
// const messages = [
//   {number: '919887981988', message: 'hello 1'},
//   {number: '919610417000', message: 'hello 1'}
// ];

//sendMessages(messages);


app.use('/sendMessage', async (req, res, next) => {
  console.log('i will send message');
  const number = req.query.number;
  const message = req.query.message;
  const company = req.query.company;
  console.log(number,message,company);
  sendMessage(number, message,company);
  return res.json({ sent: true });
});

app.use('/', async (req, res, next) => {
  console.log('I will send array Messages');
  const messages = req.body.messages;
  const company = req.body.company;
  sendMessages(messages, company);
  return res.json({ sent: true });
});


const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log('whatsapp webapp listening on port !'+port);
});

module.exports = app;
