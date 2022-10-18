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

const url = 'https://www.coingecko.com/en/coins/';
const linkPrice = {};

app.get('/', (req, res) => {
  res.json('Welcome to the CoinGecko Webscraper & Discord BOT');
});

function relDiff(a, b) {
  return 100 * Math.abs((a - b) / ((a + b) / 2));
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => {
  console.log('Bot is online');

  client.user.setActivity(`WAITING FOR COMMANDS`);
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  //messages

  const messageArray = message.content.split(' ');
  const argument = messageArray.slice(1);
  const cmd = messageArray[0];

  var newNumber;
  var baseNumber;
  var originalNumber;

  //commands
  if (command === 'test') {
    message.channel.send('The bot is currently working properly!');
  }

  if (command === 'ping') {
    message.channel.send('Pong');
  }

  if (command) {
    axios(`${url}${command}`)
      .then((response) => {
        const html = response.data;
        const $ = cheerio.load(html);

        const item = $('body > div.container ');
        // console.log(item);

        linkPrice.value = $(item).find('.no-wrap').first().text();
        baseNumber = Number(linkPrice.value.replace(/[^0-9.-]+/g, ''));
        originalNumber = baseNumber;
        console.log(
          `Setting Market $${
            command.charAt(0).toUpperCase() + command.substring(1)
          } price: ${baseNumber}`
        );
        message.channel.send(
          `Setting Market ${
            command.charAt(0).toUpperCase() + command.substring(1)
          } price: $${baseNumber}. Checking every 30 seconds. Will notify IF price changes.`
        );
      })
      .catch(function (error) {
        console.log(error.response);
        message.channel.send(`Price Set Error`);
      });
    setInterval(() => {
      axios(`${url}${command}`)
        .then((response) => {
          const html = response.data;
          const $ = cheerio.load(html);

          const item = $('body > div.container ');
          // console.log(item);

          linkPrice.value = $(item).find('.no-wrap').first().text();
          newNumber = Number(linkPrice.value.replace(/[^0-9.-]+/g, ''));
          console.log(
            `Current Price of ${
              command.charAt(0).toUpperCase() + command.substring(1)
            } is $${newNumber}`
          );
        })
        .then(() => {
          if (newNumber != baseNumber) {
            let percentIncrease = relDiff(newNumber, baseNumber).toFixed(2);

            if (newNumber > baseNumber) {
              console.log(
                `${
                  command.charAt(0).toUpperCase() + command.substring(1)
                } Price Change 🚨ALERT🚨 The Price of ${
                  command.charAt(0).toUpperCase() + command.substring(1)
                } has increased 🔼🔼 by ${percentIncrease}% to $${newNumber}.`
              );
              message.channel.send(
                `${
                  command.charAt(0).toUpperCase() + command.substring(1)
                } Price Change 🚨ALERT🚨 The Price of ${
                  command.charAt(0).toUpperCase() + command.substring(1)
                } has increased 🔼🔼 by ${percentIncrease}% to $${newNumber}.`
              );
            }
            if (newNumber < baseNumber) {
              console.log(
                `${
                  command.charAt(0).toUpperCase() + command.substring(1)
                } Price Change 🚨ALERT🚨 The Price of ${
                  command.charAt(0).toUpperCase() + command.substring(1)
                } has decreased 🔻🔻 by ${percentIncrease}% to $${newNumber}.`
              );
              message.channel.send(
                `${
                  command.charAt(0).toUpperCase() + command.substring(1)
                } Price Change 🚨ALERT🚨 The Price of ${
                  command.charAt(0).toUpperCase() + command.substring(1)
                } has decreased🔻🔻 by ${percentIncrease}% to $${newNumber}.`
              );
            }

            baseNumber = newNumber;
            console.log(`Market price UPDATED to $${baseNumber}`);
            message.channel.send(
              `Market Price UPDATED to: $${baseNumber}. Original Price of ${
                command.charAt(0).toUpperCase() + command.substring(1)
              }: $${originalNumber}.`
            );
          }
        })
        .catch(function (error) {
          console.log(error.response);
          message.channel.send(`Interval Error: Try another name`);
        });
    }, 30000);
  }
});

client.login(process.env.CLIENT_TOKEN);

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
