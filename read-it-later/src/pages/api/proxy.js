import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { url } = req.query; // Get the URL from query params

  if (!url) {
    return res.status(400).json({ error: "Missing 'url' query parameter" });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0", // Some sites block requests without a User-Agent
      },
    });

    res.status(200).json({ contents: response.data });
  } catch (error) {
    console.error("Error fetching URL:", error);
    res.status(500).json({ error: "Failed to fetch the URL" });
  }
}
