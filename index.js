const PORT = 8000;
const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();

const url = 'https://www.coingecko.com/en/coins/chainlink';
const linkPrice = {};

app.get('/', (req, res) => {
  res.json('Welcome to the 4chan Webscraper API');
});

const getLink = () => {
  axios(url).then((response) => {
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

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
