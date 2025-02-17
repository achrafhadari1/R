"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchForm } from "@/components/search-form";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import { AppContext } from "../app/Context/AppContext";
import AxiosInstance from "@/lib/axiosInstance";
import { BiRefresh } from "react-icons/bi";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import { AddFeed } from "@/app/home/components/addFeed";
import { getCookie } from "cookies-next";

export function AppSidebar({ ...props }) {
  const { user, loading } = useContext(AppContext);
  const router = useRouter();
  const pathname = usePathname();
  const [activePath, setActivePath] = useState("");
  const [feeds, setFeeds] = useState([]);
  const [progress, setProgress] = useState(0);
  const [disabledFeedId, setDisabledFeedId] = useState(null);
  const [feedUrl, setFeedUrl] = useState(""); // Add feedUrl state
  const [feedId, setFeedId] = useState(null); // Make sure feedId state is here
  const handleCompleteFeedProcess = async () => {
    try {
      setProgress(0); // Set initial progress

      const token = getCookie("token");

      // Step 1: Add feed to the backend
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
      refreshFeed();
      setProgress(20); // Set progress as 20% after feed added
      setDisabledFeedId(newFeedId);

      // Step 2: Fetch the RSS feed using a proxy
      const proxyUrl =
        "https://api.allorigins.win/get?url=" + encodeURIComponent(feedUrl);

      const fetchResponse = await fetch(proxyUrl);
      if (!fetchResponse.ok) {
        throw new Error(
          `Failed to fetch RSS feed: ${fetchResponse.statusText}`
        );
      }

      const responseJson = await fetchResponse.json(); // Get the RSS content
      const rssText = responseJson.contents;

      // Step 3: Parse the RSS feed
      const parser = new DOMParser();
      const rssDoc = parser.parseFromString(rssText, "application/xml");

      // Extract global feed details
      const feedTitle =
        rssDoc.querySelector("channel > title")?.textContent || "No Title";
      const feedDescription =
        rssDoc.querySelector("channel > description")?.textContent ||
        "No Description";
      const feedLink = rssDoc.querySelector("channel > link") || "No Link";
      const href = feedLink?.getAttribute("href");
      console.log("Feed Metadata:", { feedTitle, feedDescription, href });

      // Send feed metadata to the backend to update the feed
      await AxiosInstance.put(
        `/feeds/${newFeedId}`,
        {
          title: feedTitle,
          description: feedDescription,
          link: href,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Extract individual articles
      const items = rssDoc.querySelectorAll("item");
      const articles = Array.from(items).map((item) => ({
        title: item.querySelector("title")?.textContent || "No Title",
        link: item.querySelector("link")?.textContent || "No Link",
        description:
          item.querySelector("description")?.textContent || "No Description",
        pubDate: item.querySelector("pubDate")?.textContent || null,
      }));

      console.log("Parsed Articles:", articles);

      // Limit the number of articles to parse further (e.g., 6 articles)
      const links = articles.slice(0, 6).map((article) => article.link);

      // Step 4: Parse individual articles
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

      // Step 5: Save parsed articles to the backend
      setProgress(60); // Set progress to 60% while saving articles
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
      setProgress(100); // Set progress to 100% after completing the process
    } catch (error) {
      console.error("Error in the feed process:", error);
      setError("Failed to complete feed process. Please try again.");
    } finally {
      setDisabledFeedId(null); // Enable feed after process completes
    }
  };
  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const token = getCookie("token");
        const response = await AxiosInstance.get("/feeds", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const fetchedFeeds = response.data.map((feed) => ({
          id: feed.id,
          title: feed.title,
          url: feed.feed_url, // Displayed title
          // Dynamic link
        }));

        setFeeds(fetchedFeeds); // Store feeds in state
        console.log(fetchedFeeds);
      } catch (error) {
        console.error("Error fetching feeds:", error);
      }
    };

    fetchFeeds();
    console.log(feeds);
  }, []);
  const refreshFeed = async () => {
    try {
      const token = getCookie("token");
      const response = await AxiosInstance.get("/feeds", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedFeeds = response.data.map((feed) => ({
        id: feed.id,
        title: feed.title, // Displayed title
        // Dynamic link
      }));

      setFeeds(fetchedFeeds); // Store feeds in state
    } catch (error) {
      console.error("Error fetching feeds:", error);
    }
  };
  useEffect(() => {
    // Update active path when pathname changes
    setActivePath(pathname);
  }, [pathname]);
  const handleRefreshFeedOnly = async (feedId, feedUrl) => {
    try {
      console.log(feeds);
      setProgress(0); // Start progress tracking
      setDisabledFeedId(feedId); // Disable the feed while processing

      // Step 1: Fetch the RSS feed using a proxy
      const proxyUrl =
        "https://api.allorigins.win/get?url=" + encodeURIComponent(feedUrl);

      const fetchResponse = await fetch(proxyUrl);
      if (!fetchResponse.ok) {
        throw new Error(
          `Failed to fetch RSS feed: ${fetchResponse.statusText}`
        );
      }

      const responseJson = await fetchResponse.json();
      const rssText = responseJson.contents;

      // Step 2: Parse the RSS feed
      const parser = new DOMParser();
      const rssDoc = parser.parseFromString(rssText, "application/xml");

      // Extract individual articles
      const items = rssDoc.querySelectorAll("item");
      const articles = Array.from(items).map((item) => ({
        title: item.querySelector("title")?.textContent || "No Title",
        link: item.querySelector("link")?.textContent || "No Link",
        description:
          item.querySelector("description")?.textContent || "No Description",
        pubDate: item.querySelector("pubDate")?.textContent || null,
      }));

      console.log("Parsed Articles:", articles);

      // Limit to the first 6 articles
      const links = articles.slice(0, 6).map((article) => article.link);

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
          url: data.url || link,
          domain: data.domain || "www.google.com",
          excerpt: data.excerpt || "",
          word_count: data.word_count || "",
          author: data.author || "",
        });
      }

      // Step 4: Save parsed articles to the backend
      const token = getCookie("token");

      // Fetch existing articles for this feed to check for duplicates
      const existingArticlesResponse = await AxiosInstance.get(
        `/feeds/${feedId}/articles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const existingArticles = existingArticlesResponse.data;

      // Filter out new articles that don't already exist
      const newArticles = parsedData.filter(
        (article) =>
          !existingArticles.some((existing) => existing.title === article.title)
      );

      if (newArticles.length > 0) {
        const saveArticlesResponse = await AxiosInstance.post(
          "/articles/saveArticlesFeed",
          {
            feed_id: feedId,
            articles: newArticles,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("New articles saved:", saveArticlesResponse.data);
      } else {
        console.log("No new articles to save.");
      }

      setProgress(100); // Mark progress as complete
    } catch (error) {
      console.error("Error refreshing feed:", error);
    } finally {
      setDisabledFeedId(null); // Enable the feed after processing
    }
  };

  const navMain = [
    {
      title: "Home",
      url: "/",
      items: [
        { title: "Articles", url: "/home", key: "001" },
        { title: "Archived Articles", url: "/archived-articles", key: "002" },
        { title: "Highlights", url: "/highlights", key: "003" },
      ],
    },
    {
      title: (
        <div className="flex items-center justify-between w-full text-[18px]">
          Feeds{" "}
          <AddFeed
            feedUrl={feedUrl}
            setFeedUrl={setFeedUrl}
            progress={progress}
            setProgress={setProgress}
            disabledFeedId={disabledFeedId}
            setFeedId={setFeedId}
            setDisabledFeedId={setDisabledFeedId}
            handleCompleteFeedProcess={handleCompleteFeedProcess}
          />
        </div>
      ),
      url: "/feeds",
      items: feeds.map((feed) => ({
        key: feed.id, // Unique key for each feed
        title: (
          <>
            <div
              className={`feed-item ${
                disabledFeedId === feed.id ? "disabled" : ""
              }`}
              style={{
                pointerEvents: disabledFeedId === feed.id ? "none" : "auto", // Disable interaction
              }}
            >
              <span>{feed.title}</span>
              {disabledFeedId === feed.id && (
                <span className="loading-text disabled">Processing...</span>
              )}
            </div>
            <div>
              <BiRefresh
                onClick={(e) => {
                  e.preventDefault();
                  handleRefreshFeedOnly(feed.id, feed.url); // Pass feedId and feedUrl
                }}
              />
            </div>
          </>
        ),
        url: `/feed/${user.id}/${feed.id}`, // Feed URL with user ID and feed ID
      })),
    },

    {
      title: "Settings",
      url: "/settings",
      items: [
        {
          title: "File Conventions",
          url: "/settings/file-conventions",
          key: "004",
        },
      ],
    },
  ];

  return (
    <Sidebar className="sumanafont" {...props}>
      <SidebarHeader>
        <div className="flex justify-center text-center">
          <img className="w-32 h-16 object-cover" src="/logo-2.svg" alt="" />
        </div>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-[18px]">
              {group.title /* This now supports JSX */}
            </SidebarGroupLabel>
            <SidebarGroupContent className="text-[17px]">
              <SidebarMenu className="text-[17px]">
                {group.items.map((item) => {
                  // Determine if the item is active
                  const isActive = pathname === item.url;

                  return (
                    <SidebarMenuItem key={item.key} className="text-[17px]">
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="text-[17px] justify-between"
                      >
                        <a href={item.url}>{item.title}</a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
