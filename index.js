const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
const { Client, GatewayIntentBits } = require('discord.js');

const PORT = 8000;
let SECONDS = 5;
let INTERVAL = SECONDS * 1000;
require('dotenv').config(); //initialize dotenv
const prefix = '>';

const app = express();

const url = 'https://www.coingecko.com/en/coins/';
const coinPrice = {};

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
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  //messages

  var newNumber;
  var baseNumber;
  var originalNumber;
  var errorMsg;

  //commands
  if (command === 'test') {
    message.channel.send('Commands are currently working properly!');
  }

  if (command === 'stop') {
    message.channel.send('Halting Bots!').then(() => {
      process.exit(0);
    });
  }

  if (command == Number(command)) {
    SECONDS = command;
    message.channel.send(`Interval updated to ${SECONDS} SECONDS!`);
  }

  if (command != Number(command)) {
    axios(`${url}${command}`)
      .then((response) => {
        const html = response.data;
        const $ = cheerio.load(html);

        const targetContainer = $('body > div.container ');
        // console.log(targetContainer);

        coinPrice.value = $(targetContainer).find('.no-wrap').first().text();
        baseNumber = Number(coinPrice.value.replace(/[^0-9.-]+/g, ''));
        originalNumber = baseNumber;
        console.log(
          `Setting Market ${
            command.charAt(0).toUpperCase() + command.substring(1)
          } price: $${baseNumber}`
        );
        message.channel.send(
          `Setting Market ${
            command.charAt(0).toUpperCase() + command.substring(1)
          } price: $${baseNumber}. Checking every ${SECONDS} seconds. Will notify IF price changes.`
        );
      })
      .catch(function (error) {
        console.log(error.response.status);
        if (error.response.status === 404) {
          errorMsg = error.response.status;
          message.channel
            .send(
              `1. ${error.response.status} | COIN ${error.response.statusText} | Bots Halted. Enter Commands again`
            )
            .then(() => {
              setImmediate(() => process.exit(0));
              return null;
            });
        }
      })
      .finally(() => {
        console.log();
        if (command != 'stop' || errorMsg != 404 || command != Number(command))
          setInterval(() => {
            axios(`${url}${command}`)
              .then((response) => {
                const html = response.data;
                const $ = cheerio.load(html);

                const item = $('body > div.container ');
                // console.log(item);

                coinPrice.value = $(item).find('.no-wrap').first().text();
                newNumber = Number(coinPrice.value.replace(/[^0-9.-]+/g, ''));
                console.log(
                  `Current Price of ${
                    command.charAt(0).toUpperCase() + command.substring(1)
                  } is $${newNumber}`
                );
              })
              .then(() => {
                if (newNumber != baseNumber) {
                  let percentIncrease = relDiff(newNumber, baseNumber).toFixed(
                    2
                  );

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
                console.log(error.response.status);
                if (error.response.status === 404) {
                  message.channel
                    .send(
                      `2. ${error.response.status} | ${error.response.statusText} | Halting Bots`
                    )
                    .then(() => {
                      setImmediate(() => process.exit(0));
                      return null;
                    });
                }
              });
          }, INTERVAL);
      });
  }
});

client.login(process.env.CLIENT_TOKEN);

app.listen(process.env.PORT || PORT),
  () => console.log(`Server running on PORT ${PORT}`);
