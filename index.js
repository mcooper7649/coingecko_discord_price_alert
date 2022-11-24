const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
const { Client, GatewayIntentBits } = require('discord.js');

const PORT = 8000;
SECONDS = 5;
minChange = 0.00999;
halted = false;

require('dotenv').config(); //initialize dotenv
const prefix = '$';
const prefix2 = '^';
const prefix3 = '%';

// var newNumber;

const coinPrice = {};
let cmdList = new Set();
const app = express();

const url = 'https://www.coingecko.com/en/coins/';

app.get('/', (req, res) => {
  res.json(
    'Welcome to the CoinGecko Webscraper & Discord BOT 1.0. Please send your Commands via Discord. Example Command: $Ethereum. Kill the Server to stop the bot(s). Additional Features Requests? DM ME.'
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
  client.user.setActivity(`ENTER A CMD $bitcoin`);
});

client.on('messageCreate', async (message) => {
  let command;
  let minPercentChange = Number();
  // let myInterval = () => {};
  let interval = Number();
  let stopInterval = () => {
    clearInterval(global.myInterval);
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
      global.halted = true;
      cmdList.clear();
      stopInterval();
      console.log('Interval Interrupted');
      message = await message.reply({
        content: 'Bots Halted. Bots Awaiting New Commands',
        fetchReply: true,
      });
      message.react('☠️');
    } else {
      global.halted = false;
      if (cmdList.has(command)) {
        console.log('This Token is Already in List');
      } else {
        cmdList.add(command);
        cmdList.forEach((command) => {
          axios(`${url}${command}`)
            .then((response) => {
              const html = response.data;
              const $ = cheerio.load(html);
              const targetContainer = $('body > div.container ');

              //Assigning Variables

              //Current Rank
              let coinRank = $(targetContainer)
                .find('tr:nth-child(5) > td > span')
                .text();

              coinRank = coinRank.replace(/[^0-9#.-]+/g, '');
              //Current Price
              coinPrice.value = $(targetContainer)
                .find('.no-wrap')
                .first()
                .text();

              let baseNumber = Number(
                coinPrice.value.replace(/[^0-9.-]+/g, '')
              );
              console.log(
                `Setting Market ${command} price: $${baseNumber}. ${command} is currently ranked ${coinRank}`
              );
              let projectName =
                command.charAt(0).toUpperCase() + command.substring(1);
              message.channel.send(
                `Setting Market ${projectName} price: $${baseNumber}. Checking every ${global.SECONDS} seconds. Will notify IF price changes. ${projectName} is currently ranked ${coinRank} on CoinGecko.`
              );

              global.myInterval = setInterval(
                () => {
                  if (global.halted != true) {
                    axios(`${url}${command}`)
                      .then((response) => {
                        const html = response.data;
                        const $ = cheerio.load(html);
                        const item = $('body > div.container ');

                        coinPrice.oneHour = $(targetContainer)
                          .find(
                            'div.my-4 > div:nth-child(2) > div.tw-flex-1.py-2.border.px-0.tw-rounded-md.tw-rounded-t-none.tw-rounded-r-none > span'
                          )
                          .text();

                        coinPrice.oneDay = $(targetContainer)
                          .find(
                            'div.my-4 > div:nth-child(2) > div:nth-child(2) > span'
                          )
                          .text();

                        console.log(coinPrice.oneDay);

                        coinPrice.value = $(item)
                          .find('.no-wrap')
                          .first()
                          .text();
                        global.newNumber = Number(
                          coinPrice.value.replace(/[^0-9.-]+/g, '')
                        );
                        console.log(
                          `Current Price of ${projectName} is $${newNumber}. Updating every ${
                            global.SECONDS
                          } seconds.  ${new Date(Date.now())}`
                        );
                      })
                      .then(() => {
                        if (newNumber != baseNumber) {
                          if (newNumber > baseNumber) {
                            let percentIncrease = relDiff(
                              newNumber,
                              baseNumber
                            ).toFixed(2);
                            if (percentIncrease > global.minChange) {
                              console.log(
                                `${projectName} Price Change 🚨ALERT🚨 The Price of ${projectName} has increased 🔼🔼 by ${percentIncrease}% to $${newNumber}.`
                              );
                              message.channel.send(
                                `${projectName} Price Change 🚨ALERT🚨 The Price of ${projectName} has increased 🔼🔼 by ${percentIncrease}% to $${newNumber}.`
                              );
                              baseNumber = newNumber;
                              console.log(
                                `Market price UPDATED to $${baseNumber}`
                              );
                              message.channel.send(
                                `Market Price UPDATED to: $${baseNumber}. Price of ${projectName} has changed ${coinPrice.oneHour} in the last hour and ${coinPrice.oneDay} in the last 24 hours.`
                              );
                            }
                          }

                          if (newNumber < baseNumber) {
                            let percentDecrease = relDiff(
                              baseNumber,
                              newNumber
                            ).toFixed(2);

                            if (percentDecrease > global.minChange) {
                              console.log(
                                `${projectName} Price Change 🚨ALERT🚨 The Price of ${projectName} has decreased 🔻🔻 by ${percentDecrease}% to $${newNumber}.`
                              );
                              message.channel.send(
                                `${projectName} Price Change 🚨ALERT🚨 The Price of ${projectName} has decreased🔻🔻 by ${percentDecrease}% to $${newNumber}.`
                              );
                              baseNumber = newNumber;
                              console.log(
                                `Market price UPDATED to $${baseNumber}`
                              );
                              message.channel.send(
                                `Market Price UPDATED to: $${baseNumber}. Price of ${projectName} has changed ${coinPrice.oneHour} in the last hour and ${coinPrice.oneDay} in the last 24 hours.`
                              );
                            }
                          }
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
                  }
                },
                global.SECONDS * 1000,
                console.log(
                  global.SECONDS,
                  'Interval hit',
                  new Date(Date.now())
                )
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
        });
      }

      console.log(cmdList);
    }
  }

  if (message.content.startsWith(prefix2)) {
    const args2 = message.content.slice(prefix2.length).split(/ +/);
    interval = args2.shift().toLowerCase();
    // Intervals
    if (typeof interval !== Number(interval)) {
      if (interval === 'stop') {
        message = await message.reply({
          content: 'Bots Halted. Bots Awaiting New Commands',
          fetchReply: true,
        });
        message.react('☠️');
        stopInterval();
      } else {
        global.SECONDS = Number(interval);
        console.log(global.SECONDS);
        message.channel.send(`Updated Interval to ${interval}`);
      }
    }

    //messages
  }

  if (message.content.startsWith(prefix3)) {
    const args2 = message.content.slice(prefix3.length).split(/ +/);
    minPercentChange = args2.shift().toLowerCase();
    // Intervals
    if (typeof minPercentChange !== Number(minPercentChange)) {
      if (minPercentChange === 'stop') {
        message = await message.reply({
          content: 'Bots Halted. Bots Awaiting New Commands',
          fetchReply: true,
        });
        message.react('☠️');
        stopInterval();
      } else {
        global.minChange = Number(minPercentChange);
        console.log(global.minChange);
        message.channel.send(
          `Updated Percent Change Minimum to ${minPercentChange}`
        );
      }
    }
  }
});

// > Commands

client.login(process.env.CLIENT_TOKEN);

app.listen(process.env.PORT || PORT),
  () => console.log(`Server running on PORT ${PORT}`);
