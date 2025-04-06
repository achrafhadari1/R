import Mercury from "@postlight/mercury-parser";
import { chromium } from "playwright";

const countWords = (text) => {
  return text
    ? text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length
    : 0;
};
export async function parseArticle(url) {
  if (!url) {
    throw new Error("URL is required");
  }

  try {
    //  Mercury to parse the URL and get the basic metadata
    const mercuryResult = await Mercury.parse(url);
    console.log("Mercury Result:", mercuryResult);

    const puppeteerResult = await scrapeWithPlaywright(url);

    const puppeteerContent = puppeteerResult?.content || "";
    const mercuryContent = mercuryResult?.content || "";

    const finalContent =
      countWords(puppeteerContent) < 40 ? mercuryContent : puppeteerContent;

    const combinedResult = {
      title: mercuryResult.title || puppeteerResult.title,
      lead_image_url:
        mercuryResult.lead_image_url ||
        puppeteerResult.lead_image_url ||
        "/not-found.png",
      content: finalContent,
      date_published: mercuryResult.date_published,
      url: mercuryResult.url,
      domain: mercuryResult.domain,
      excerpt: mercuryResult.excerpt || "",
      word_count: countWords(finalContent),
      author: mercuryResult.author,
    };

    return combinedResult;
  } catch (error) {
    console.error("Error during article parsing:", error);
    throw error;
  }
}

// Function to scrape additional content using Puppeteer
async function scrapeWithPlaywright(url) {
  const browser = await chromium.launch(); // Launch Playwright browser
  const page = await browser.newPage();
  await page.goto(url, { timeout: 0 });

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
