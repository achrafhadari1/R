"use client";
import { getCookie } from "cookies-next";
import { FiCheckSquare } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import AxiosInstance from "@/lib/axiosInstance";
export const AddFeed = () => {
  const [feedUrl, setFeedUrl] = useState("");
  const [parsedArticles, setParsedArticles] = useState([]); // State to store parsed articles
  const [error, setError] = useState(null);
  const [feedLinks, setFeedLinks] = useState([]);
  const [feedId, setFeedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleCompleteFeedProcess = async () => {
    try {
      // Step 1: Add the feed
      const token = getCookie("token");
      const addFeedResponse = await AxiosInstance.post(
        "/feeds",
        { feed_url: feedUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Feed added:", addFeedResponse.data);
      const newFeedId = addFeedResponse.data.id;
      setFeedId(newFeedId); // Update state

      // Step 2: Fetch the feed and parse RSS
      const proxyUrl =
        "https://api.allorigins.win/get?url=" + encodeURIComponent(feedUrl);

      // Fetch the RSS feed using the proxy
      const fetchResponse = await fetch(proxyUrl);

      if (!fetchResponse.ok) {
        throw new Error(
          `Failed to fetch RSS feed: ${fetchResponse.statusText}`
        );
      }

      const responseJson = await fetchResponse.json(); // The response is returned in JSON format from AllOrigins
      const rssText = responseJson.contents; // Get the actual RSS content from the response JSON

      // Parse the RSS feed
      const parser = new DOMParser();
      const rssDoc = parser.parseFromString(rssText, "application/xml");
      const items = rssDoc.querySelectorAll("item");

      const articles = Array.from(items).map((item) => ({
        link: item.querySelector("link")?.textContent || "No Link",
      }));
      const links = articles.slice(0, 2).map((article) => article.link);
      console.log("Parsed Articles:", articles);

      // Step 3: Parse individual articles
      const parsedData = [];
      for (const link of links) {
        const parseResponse = await fetch("/api/parse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: link }),
        });

        if (!parseResponse.ok) {
          console.error(`Failed to parse article: ${link}`);
          continue;
        }

        const data = await parseResponse.json();
        parsedData.push({
          title: data.title,
          lead_image: data.lead_image_url,
          content: data.content,
          date_published: data.date_published,
          url: data.url,
          domain: data.domain,
          excerpt: data.excerpt,
          word_count: data.word_count,
          author: data.author,
        });
      }

      // Step 4: Save parsed articles to the backend
      const saveArticlesResponse = await AxiosInstance.post(
        "/articles/saveArticlesFeed",
        {
          feed_id: newFeedId,
          articles: parsedData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Articles saved:", saveArticlesResponse.data);
      setFeedUrl(""); // Reset input
    } catch (error) {
      console.error("Error in the feed process:", error);
      setError("Failed to complete feed process. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Call this function on button click or as needed
  const handleProcessFeed = async (e) => {
    e.preventDefault();
    setLoading(true);
    await handleCompleteFeedProcess(e);
  };

  return (
    <Dialog className="">
      <DialogTrigger asChild>
        <Button variant="outline" className="h-6">
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md z-index-top">
        <DialogHeader>
          <DialogTitle>Add feed</DialogTitle>
          <DialogDescription>it may takes some time!</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              placeholder="Enter RSS feed URL"
            />
          </div>
          <Button
            onClick={handleProcessFeed}
            type="submit"
            size="sm"
            className="px-3"
          >
            <span className="sr-only">submit</span>
            <FiCheckSquare />
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
