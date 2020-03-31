const puppeteer = require('puppeteer');
const Promise = require('bluebird');
const fs = require('fs');
const moment = require('moment');

require('dotenv').config();

const client = require('twilio')(process.env.accountSid, process.env.authToken);

const file = require('./items');

const items = file.items;

async function checkItem(page, item) {
  console.log(`Checking ${item.name}`);
  await page.goto(item.url);

  const canAdd = await page.$('#add-to-cart-button');
  const notInStock = (await page.content()).match(/in stock on/gi);

  return canAdd && !notInStock;
}

async function sendSMS(item) {
  return client.messages.create({
    body: `${item.name} available! ${item.url}`,
    from: process.env.twilioFrom,
    to: process.env.twilioTo
  });
}

async function run() {
  console.log('');
  console.log(`Starting at ${moment().toISOString()}`);
  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  await page.setViewport({
    width: 1680,
    height: 1050
  });

  await Promise.map(
    items,
    async item => {
      const oneDayAgo = moment().subtract(1, 'days');
      if (!item.found || moment(item.found).isBefore(oneDayAgo)) {
        const available = await checkItem(page, item);

        if (available) {
          item.found = moment().toISOString();
          console.log(`${item.name} is available.`);
          await sendSMS(item);
        } else {
          console.log(`${item.name} is not available.`);
        }
        console.log('Waiting...');
        return Promise.delay(4000);
      }
    },
    { concurrency: 1 }
  );

  const update = { items: items };
  console.log('finishing...');
  fs.writeFileSync('items.json', JSON.stringify(update, null, 4));
  await browser.close();
  console.log('browser closed');
  return;
}

run();

setInterval(async function() {
  await run();
  console.log('back');
  console.log('waiting 15 minutes');
}, 15 * 60 * 1000);
