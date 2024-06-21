const puppeteer = require("puppeteer");
const fs = require("fs");
const url = "http://www.parliament.go.ke/the-national-assembly/mps";

const main = async () => {
  console.log('Opening browser')
  let MPIGS = [];
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "load" });

  let num = 1;
  while (num <= 36) {
    await page.waitForNetworkIdle({ timeout: 30000 });
    const allMpigs = await page.evaluate(() => {
      const mpigs = document.querySelectorAll(".mp");
      const nav = document.querySelectorAll(".pager__item");
      // isLastPage =
      //   nav[nav.length - 1]?.querySelector("visually-hidden")?.innerText !==
      //   "Last page";
      text = nav[nav.length - 1]?.querySelector("visually-hidden")?.innerText;
      return Array.from(mpigs).map((mpig) => {
        const name =
          mpig.querySelector(".views-field-field-name")?.innerText || "";
        const county =
          mpig.querySelector(".views-field-field-county")?.innerText || "";
        const constituency =
          mpig.querySelector(".views-field-field-constituency")?.innerText ||
          "";
        const party = mpig.querySelector(".views-field-field-party")?.innerText;
        const status =
          mpig.querySelector(".views-field-field-status")?.innerText || "";
        const image = mpig.querySelector("img").src || "";
        const url = mpig.querySelector("a").href || "";
        return {
          name,
          url,
          constituency,
          county,
          party,
          status,
          image,
        };
      });
    });
    MPIGS = [...MPIGS, ...allMpigs];
    if (num < 36) {
      await page.waitForSelector("li.pager__item.pager__item--next", {
        visible: true,
      });
      await page.click("li.pager__item.pager__item--next");
      await page.waitForNetworkIdle();
    }
    num += 1;
  }
  // console.log(MPIGS);
  await page.close();
  await dumpArrayToJsonFile(MPIGS);
};

// main();

async function dumpArrayToJsonFile(arrayData, filename = "mpigs.json") {
  // Convert array to JSON format
  const jsonData = JSON.stringify(arrayData, null, 2); // null and 2 for pretty formatting

  // Write JSON data to a file
  fs.writeFile(filename, jsonData, "utf8", (err) => {
    if (err) {
      console.log(`Error writing ${filename}:`, err);
      return;
    }
    console.log(`Data has been written to ${filename}`);
  });
}

main();

