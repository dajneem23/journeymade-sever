import puppeteer from 'puppeteer';
const proxyChain = require('proxy-chain');

const WebShareProxy = 'http://aveofymr-rotate:3myhzwukr2fe@p.webshare.io:80';

export default function () {
  (async () => {
    const newProxyUrl = await proxyChain.anonymizeProxy(WebShareProxy);

    const browser = await puppeteer.launch({
      headless: true,
      // args: [ `--proxy-server=${WebShareProxy}` ]
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        `--proxy-server=${newProxyUrl}`,
      ],
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(120000);
    // await page.setRequestInterception(true);

    // console.log('🚀 ~ file: index.ts:13 ~ page:', page);

    await page.goto(
      'https://debank.com/profile/0xdb9d281c3d29baa9587f5dac99dd982156913913',
      { waitUntil: 'load', timeout: 60000 },
    );

    const data = await page.content();
    console.log("🚀 ~ file: index.ts:34 ~ data:", data)
    // const bodyHandle = await page.$('body');
    // const html = await page.evaluate((body) => body.innerHTML, bodyHandle);
    // console.log('🚀 ~ file: index.ts:28 ~ html:', html);

    // const a = await page.goto('https://api.debank.com/token/cache_balance_list?user_addr=0xdb9d281c3d29baa9587f5dac99dd982156913913');
    // console.log("🚀 ~ file: index.ts:26 ~ a:", a)

    // const getThemAll = await page.$$('[class^="table_contentRow_"]')
    // console.log("🚀 ~ file: index.ts:27 ~ getThemAll:", getThemAll)

    // // Set screen size
    // await page.setViewport({width: 1080, height: 1024});

    // // Type into search box
    // await page.type('.search-box__input', 'automate beyond recorder');

    // // Wait and click on first result
    // const searchResultSelector = '.search-box__link';
    // await page.waitForSelector(searchResultSelector);
    // await page.click(searchResultSelector);

    // // Locate the full title with a unique string
    // const textSelector = await page.waitForSelector(
    //   'text/Customize and automate'
    // );
    // const fullTitle = await textSelector.evaluate(el => el.textContent);

    // // Print the full title
    // console.log('The title of this blog post is "%s".', fullTitle);

    // await browser.close();
  })();

  return;
}
