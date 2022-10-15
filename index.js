const PORT = 8000;
const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
  Permissions,
} = require('discord.js');

require('dotenv').config(); //initialize dotenv
const prefix = '>';

const app = express();

const url = 'https://www.coingecko.com/en/coins/chainlink';
const linkPrice = {};

app.get('/', (req, res) => {
  res.json('Welcome to the 4chan Webscraper API');
});

const getLink = async () => {
  await axios(url).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    const item = $('body > div.container ');
    // console.log(item);

    linkPrice.value = $(item).find('.no-wrap').first().text();
    console.log(`Current price of link is ${linkPrice.value}`);
  });
};

app.get('/link', (req, res) => {
  setInterval(() => {
    getLink();
  }, 5000);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => {
  console.log('Bot is online');

  client.user.setActivity(`I'm the Coingecko BOT.{type: "WATCHING"}`);
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  //messages

  const messageArray = message.content.split(' ');
  const argument = messageArray.slice(1);
  const cmd = messageArray[0];

  //commands
  if (command === 'test') {
    message.channel.send('The bot is currently working properly!');
  }

  if (command === 'ping') {
    message.channel.send('Pong');
  }

  if (command === 'link') {
    await axios(url).then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      const item = $('body > div.container ');
      // console.log(item);

      linkPrice.value = $(item).find('.no-wrap').first().text();
      console.log(`Current price of link is ${linkPrice.value}`);
    });
    message.channel.send(`Current price of Chainlink is ${linkPrice.value}`);
  }
});

client.login(process.env.CLIENT_TOKEN);

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
