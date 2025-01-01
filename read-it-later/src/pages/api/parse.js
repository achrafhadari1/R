import { parseArticle } from "../../lib/mercuryparser";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  const { url } = req.body;

  try {
    // Parse the article using Mercury and Puppeteer
    const article = await parseArticle(url);
    res.status(200).json(article); // Respond with the combined parsed article
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to parse the article" });
  }
}
