import Mercury from "@postlight/mercury-parser";

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
    // Mercury to parse the URL and get the basic metadata
    const mercuryResult = await Mercury.parse(url);
    console.log("Mercury Result:", mercuryResult);

    // Use Mercury content directly
    const mercuryContent = mercuryResult?.content || "";

    const combinedResult = {
      title: mercuryResult.title,
      lead_image_url: mercuryResult.lead_image_url || "/not-found.png",
      content: mercuryContent,
      date_published: mercuryResult.date_published,
      url: mercuryResult.url,
      domain: mercuryResult.domain,
      excerpt: mercuryResult.excerpt || "",
      word_count: countWords(mercuryContent),
      author: mercuryResult.author,
    };

    return combinedResult;
  } catch (error) {
    console.error("Error during article parsing:", error);
    throw error;
  }
}
