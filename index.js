const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
const { Client, GatewayIntentBits } = require('discord.js');

const PORT = 8000;
SECONDS = 10;

require('dotenv').config(); //initialize dotenv
const prefix = '$';
const prefix2 = '>';

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
  if (
    !message.content.startsWith(prefix) ||
    message.author.bot ||
    !message.content.startsWith(prefix2)
  )
    return;
  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  const args2 = message.content.slice(prefix2.length).split(/ +/);
  const interval = args2.shift().toLowerCase();

  //messages

  var newNumber;
  var baseNumber;
  var originalNumber;
  var errorMsg;

  // Intervals

  if (interval === 'test') {
    message.channel.send('Intervals are currently working properly!');
  }

  //commands
  if (command === 'test') {
    message.channel.send('Commands are currently working properly!');
    return;
  } else if (command === 'stop') {
    message.channel.send('STOP Command Entered. Halting Bots!').then(() => {
      process.exit(0);
    });
  }

  // if (command == Number(command)) {
  //   global.SECONDS = command;
  //   message.channel.send(
  //     `Interval updated to ${global.SECONDS} SECONDS!`,
  //     new Date(Date.now())
  //   );
  // }
  else {
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
          } price: $${baseNumber}. Checking every ${
            global.SECONDS
          } seconds. Will notify IF price changes.`
        );
        setInterval(
          () => {
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
                  } is $${newNumber}. Updating every ${
                    global.SECONDS
                  } seconds.  ${new Date(Date.now())}`
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
                      `2. ${error.response.status} | ${error.response.statusText} | Interval Halted`
                    )
                    .then(() => {
                      setImmediate(() => clearInterval(setInterval));
                      return null;
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
      });
  }
});

client.login(process.env.CLIENT_TOKEN);

app.listen(process.env.PORT || PORT),
  () => console.log(`Server running on PORT ${PORT}`);
