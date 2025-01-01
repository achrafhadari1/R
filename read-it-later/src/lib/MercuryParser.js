import Mercury from "@postlight/mercury-parser";
import puppeteer from "puppeteer";

// Utility function to parse articles using both Mercury and Puppeteer
export async function parseArticle(url) {
  if (!url) {
    throw new Error("URL is required");
  }

  try {
    // Step 1: Use Mercury to parse the URL and get the basic metadata
    const mercuryResult = await Mercury.parse(url);
    console.log("Mercury Result:", mercuryResult);

    // Step 2: Use Puppeteer to scrape additional content (like specific article content, images, etc.)
    const puppeteerResult = await scrapeWithPuppeteer(url);

    // Step 3: Combine results from both sources
    const combinedResult = {
      title: puppeteerResult.title || mercuryResult.title,
      lead_image_url:
        mercuryResult.lead_image_url ||
        puppeteerResult.lead_image_url ||
        "/not-found.png",
      content: puppeteerResult.content || mercuryResult.content,
      date_published: mercuryResult.date_published,
      url: mercuryResult.url,
      domain: mercuryResult.domain,
      excerpt: mercuryResult.excerpt,
      word_count: mercuryResult.word_count,
      author: mercuryResult.author,
    };

    return combinedResult;
  } catch (error) {
    console.error("Error during article parsing:", error);
    throw error;
  }
}

// Function to scrape additional content using Puppeteer
async function scrapeWithPuppeteer(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const data = await page.evaluate(() => {
    const articleElement = document.querySelector("article");
    if (!articleElement) {
      return {};
    }

    const title = document.querySelector("h1")
      ? document.querySelector("h1").innerText
      : "";
    const lead_image_url = document.querySelector("img")
      ? document.querySelector("img").src
      : "";
    const content = articleElement.innerHTML; // Use the entire article HTML content

    return { title, lead_image_url, content };
  });

  await browser.close();
  return data;
}
