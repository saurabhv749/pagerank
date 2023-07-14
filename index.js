const puppeteer = require("puppeteer");
const express = require("express");

// Define the search engines to use
const searchEngines = [
  {
    name: "Google",
    url: "https://www.google.com/search?q=",
    selector: "div#search .MjjYud .yuRUbf a",
  },
  {
    name: "Bing",
    url: "https://www.bing.com/search?q=",
    selector: "ol li.b_algo h2 a",
  },
  {
    name: "Yahoo",
    url: "https://search.yahoo.com/search?p=",
    selector: "li .dd.algo.algo-sr a",
  },
  {
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/html/?q=",
    selector: ".results_links_deep a.result__snippet",
  },
  {
    name: "Yandex",
    url: "https://yandex.com/search/?text=",
    selector: "li.serp-item a.link.serp-url__link",
  },
  {
    name: "Ask Jeeves",
    url: "https://www.ask.com/web?q=",
    selector: "div.PartialSearchResults-item-title a",
  },
  {
    name: "StartPage",
    url: "https://www.startpage.com/do/search?q=",
    selector: ".w-gl__result-url.result-link",
  },
  {
    name: "Dogpile",
    url: "https://www.dogpile.com/serp?q=",
    selector: "div.web-bing__result a.web-bing__title",
  },
  {
    name: "Gibiru",
    url: "https://gibiru.com/results.html?q=",
    selector: "div.gsc-result .gsc-thumbnail-inside a.gs-title",
  },
  {
    name: "Swisscows",
    url: "https://swisscows.com/web?query=",
    selector: ".web-results .item-web a.site",
  },
];

const getRank = async (domainToFind, searchQuery) => {
  // console.log("getting search results");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Define the search engines to use

  const results = [];

  for (let i = 0; i < searchEngines.length; i++) {
    const searchEngine = searchEngines[i];
    let r = 999,
      links = [];
    // Navigate to the search results page
    const address = searchEngine.url + searchQuery;
    const obj = {
      searchEngine: searchEngine.name,
      url: address,
      rank: r,
    };

    // console.log(searchEngine.name);

    if (searchEngine.name === "Google") {
      let currentPageNumber = 1;
      let ls = [];
      obj["url"] = `https://www.google.com/search?q=${searchQuery}`;
      while (currentPageNumber <= 5) {
        const addr = `https://www.google.com/search?q=${searchQuery}&start=${
          (currentPageNumber - 1) * 10
        }`;
        // Navigate to the search results page
        await page.goto(addr);

        // RANKER

        const linkItems = await page.$$eval(searchEngine.selector, (as) =>
          as.map((a) => decodeURIComponent(a.href))
        );
        ls.push(...linkItems);

        // Increment the current page number
        currentPageNumber++;
      }
      links = ls;
    } else {
      await page.goto(address);
      // console.log("visiting: ", address);
      // hack
      if (searchEngine.name === "Swisscows") {
        await page.waitForSelector(searchEngine.selector);
      }
      // Find all the search result links
      links = await page.$$eval(searchEngine.selector, (as) =>
        as.map((a) => decodeURIComponent(a.href))
      );
    }

    // RANKER

    links.forEach((link, index) => {
      // console.log(link);
      if (link.includes(domainToFind) && r > index + 1) {
        r = index + 1;
      }
    });

    obj["rank"] = r;
    results.push(obj);
  }

  // console.log("collected search results");
  await browser.close();
  return results;
};

//set an instance of exress
const app = express();
app.use(express.static(__dirname + "/public"));
app.use(express.json());

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile(__dirname + "/public/index.html");
});

//tell express what to do when the / route is requested
app.get("/rank", async function (req, res) {
  const { url, query } = req.query;
  const q = query.split(/\s+/).join("+");
  const searchResults = await getRank(url, q);
  res.json(searchResults);
});

//wait for a connection
app.listen(5000, function () {
  console.log(
    "The web server is running. Please open http://localhost:5000/ in your browser."
  );
});
