const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
const { Client, GatewayIntentBits } = require('discord.js');

const PORT = 8000;
SECONDS = 10;
let myInterval;

require('dotenv').config(); //initialize dotenv
const prefix = '$';
const prefix2 = '>';

var newNumber;
var baseNumber;
var originalNumber;
const coinPrice = {};

const app = express();

const url = 'https://www.coingecko.com/en/coins/';

app.get('/', (req, res) => {
  res.json(
    'Welcome to the CoinGecko Webscraper & Discord BOT 1.0. Please send your Commands via Discord. Example Command: >Ethereum. Kill the Server to stop the bot(s). Additional Features Requests? DM ME.'
  );
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
  console.log('CoinGecko Bot Online');
  client.user.setActivity(`ENTER A CMD >bitcoin`);
});

client.on('messageCreate', async (message) => {
  let command;
  let interval = Number();
  let stopInterval = () => {
    clearInterval(myInterval);
    return null;
  };

  // if (!message.content.startsWith(prefix || prefix2 || message.author.bot))
  //   return;

  // $ Commands

  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).split(/ +/);
    command = args.shift().toLowerCase();

    //commands
    if (command === 'test') {
      message = await message.reply({
        content: 'Bot is Ready for Commands 🦾',
        fetchReply: true,
      });
      message.react('🤖');

      return;
    }
    if (command === 'stop') {
      message = await message.reply({
        content: 'Bots Halted. Bots Awaiting New Commands',
        fetchReply: true,
      });
      message.react('☠️');
      stopInterval();
    } else {
      axios(`${url}${command}`)
        .then((response) => {
          const html = response.data;
          const $ = cheerio.load(html);
          const targetContainer = $('body > div.container ');
          const oldCommand = command;
          command = command.charAt(0).toUpperCase() + command.substring(1);

          //Assigning Variables

          //Current Rank
          let coinRank = $(targetContainer)
            .find('tr:nth-child(5) > td > span')
            .text();

          coinRank = coinRank.replace(/[^0-9#.-]+/g, '');
          //Current Price
          coinPrice.value = $(targetContainer).find('.no-wrap').first().text();

          baseNumber = Number(coinPrice.value.replace(/[^0-9.-]+/g, ''));
          originalNumber = baseNumber;
          console.log(
            `Setting Market ${command} price: $${baseNumber}.${command} is currently ranked ${coinRank}`
          );
          message.channel.send(
            `Setting Market ${command} price: $${baseNumber}. Checking every ${global.SECONDS} seconds. Will notify IF price changes. ${command} is currently ranked ${coinRank} on CoinGecko.`
          );
          myInterval = setInterval(
            () => {
              axios(`${url}${oldCommand}`)
                .then((response) => {
                  const html = response.data;
                  const $ = cheerio.load(html);
                  const item = $('body > div.container ');

                  coinPrice.value = $(item).find('.no-wrap').first().text();
                  newNumber = Number(coinPrice.value.replace(/[^0-9.-]+/g, ''));
                  console.log(
                    `Current Price of ${command} is $${newNumber}. Updating every ${
                      global.SECONDS
                    } seconds.  ${new Date(Date.now())}`
                  );
                })
                .then(() => {
                  if (newNumber != baseNumber) {
                    let percentIncrease = relDiff(
                      newNumber,
                      baseNumber
                    ).toFixed(2);

                    if (newNumber > baseNumber) {
                      console.log(
                        `${command} Price Change 🚨ALERT🚨 The Price of ${command} has increased 🔼🔼 by ${percentIncrease}% to $${newNumber}.`
                      );
                      message.channel.send(
                        `${command} Price Change 🚨ALERT🚨 The Price of ${command} has increased 🔼🔼 by ${percentIncrease}% to $${newNumber}.`
                      );
                    }
                    if (newNumber < baseNumber) {
                      console.log(
                        `${command} Price Change 🚨ALERT🚨 The Price of ${command} has decreased 🔻🔻 by ${percentIncrease}% to $${newNumber}.`
                      );
                      message.channel.send(
                        `${command} Price Change 🚨ALERT🚨 The Price of ${command} has decreased🔻🔻 by ${percentIncrease}% to $${newNumber}.`
                      );
                    }

                    baseNumber = newNumber;
                    console.log(`Market price UPDATED to $${baseNumber}`);
                    message.channel.send(
                      `Market Price UPDATED to: $${baseNumber}. Original Price of ${command}: $${originalNumber}.`
                    );
                  }
                })
                .catch(function (error) {
                  console.log(error.response.status);
                  if (error.response.status === 404) {
                    message.channel
                      .send(
                        `2. ${error.response.status} | ${error.response.statusText} | Interval Halted`
                      )
                      .then(() => {
                        stopInterval();
                      });
                  }
                });
            },
            global.SECONDS * 1000,
            console.log(global.SECONDS, 'Interval hit', new Date(Date.now()))
          );
        })
        .catch(function (error) {
          console.log(error.response.status);
          if (error.response.status === 404) {
            message.channel
              .send(
                `1. ${error.response.status} | COIN ${error.response.statusText} | Bots Halted. Enter Commands again`
              )
              .then(() => {
                stopInterval();
              });
          }
        });
    }
  }

  if (message.content.startsWith(prefix2)) {
    const args2 = message.content.slice(prefix2.length).split(/ +/);
    interval = args2.shift().toLowerCase();
    // Intervals
    console.log(typeof interval);

    if (typeof interval !== Number(interval)) {
      if (interval === 'stop') {
        message.channel.send('STOP Command Entered. Halting Bots!');
        stopInterval();
      } else {
        stopInterval();
        global.SECONDS = Number(interval);
        console.log(global.SECONDS);
        message.channel.send(`Updated Interval to ${interval}`);
      }
    }

    //messages
  }
});

// > Commands

client.login(process.env.CLIENT_TOKEN);

app.listen(process.env.PORT || PORT),
  () => console.log(`Server running on PORT ${PORT}`);
