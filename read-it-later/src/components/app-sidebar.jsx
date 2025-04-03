"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchForm } from "@/components/search-form";
import { RxTrash } from "react-icons/rx";
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

import { toast } from "sonner";
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
    const token = getCookie("token");

    await toast.promise(
      (async () => {
        try {
          // Fetch the RSS feed using a proxy
          const proxyUrl = "/api/proxy?url=" + encodeURIComponent(feedUrl);
          const fetchResponse = await fetch(proxyUrl);
          if (!fetchResponse.ok) {
            throw new Error(
              `Failed to fetch RSS feed: ${fetchResponse.statusText}`
            );
          }

          const responseJson = await fetchResponse.json();
          const rssText = responseJson.contents;

          // Parse the RSS feed
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

          // Add feed to the backend
          const addFeedResponse = await AxiosInstance.post(
            "/feeds",
            { feed_url: feedUrl, title: feedTitle },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          console.log("Feed added:", addFeedResponse.data);
          const newFeedId = addFeedResponse.data.id;
          setFeedId(newFeedId);
          refreshFeed();
          setDisabledFeedId(newFeedId);

          // Update the feed metadata in the backend
          await AxiosInstance.put(
            `/feeds/${newFeedId}`,
            {
              title: feedTitle,
              description: feedDescription,
              link: href,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          // Extract articles
          const items = rssDoc.querySelectorAll("item");
          const articles = Array.from(items).map((item) => ({
            title: item.querySelector("title")?.textContent || "No Title",
            link: item.querySelector("link")?.textContent || "No Link",
            description:
              item.querySelector("description")?.textContent ||
              "No Description",
            pubDate: item.querySelector("pubDate")?.textContent || null,
          }));

          console.log("Parsed Articles:", articles);

          // Limit articles to parse further
          const links = articles.slice(0, 6).map((article) => article.link);

          // Step 4: Parse individual articles
          const parsedData = [];
          for (const link of links) {
            const parseResponse = await fetch("/api/parse", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
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

          // Save parsed articles to the backend
          await AxiosInstance.post(
            "/articles/saveArticlesFeed",
            {
              feed_id: newFeedId,
              articles: parsedData,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          refreshFeed();
          setFeedUrl(""); // Reset input
        } catch (error) {
          console.error("Error in the feed process:", error);
          setError("Failed to complete feed process. Please try again.");
          throw error;
        } finally {
          setDisabledFeedId(null);
        }
      })(),
      {
        loading: "Processing feed...",
        success: "Feed processed successfully!",
        error: "Failed to process feed. Try again.",
      }
    );
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
    const token = getCookie("token");

    await toast.promise(
      (async () => {
        try {
          const storageKey = `articles_${feedId}`;
          if (localStorage.getItem(storageKey)) {
            localStorage.removeItem(storageKey);
          }

          setProgress(0); // Start progress tracking
          setDisabledFeedId(feedId); // Disable the feed while processing

          // Fetch RSS feed using a proxy
          const proxyUrl = `/api/proxy?url=${encodeURIComponent(feedUrl)}`;
          const fetchResponse = await fetch(proxyUrl);
          if (!fetchResponse.ok)
            throw new Error(
              `Failed to fetch RSS feed: ${fetchResponse.statusText}`
            );

          const responseJson = await fetchResponse.json();
          const rssText = responseJson.contents;
          const parser = new DOMParser();
          const rssDoc = parser.parseFromString(rssText, "application/xml");
          const items = rssDoc.querySelectorAll("item");
          const articles = Array.from(items).map((item) => ({
            title: item.querySelector("title")?.textContent || "No Title",
            link: item.querySelector("link")?.textContent || "No Link",
            description:
              item.querySelector("description")?.textContent ||
              "No Description",
            pubDate: item.querySelector("pubDate")?.textContent || null,
          }));

          const links = articles.slice(0, 6).map((article) => article.link);
          const parsedData = [];

          for (const link of links) {
            const parseResponse = await fetch("/api/parse", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
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

          // Fetch existing articles to avoid duplicates
          const existingArticlesResponse = await AxiosInstance.get(
            `/feeds/${feedId}/articles`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const existingArticles = existingArticlesResponse.data;
          const newArticles = parsedData.filter(
            (article) =>
              !existingArticles.some(
                (existing) => existing.title === article.title
              )
          );

          if (newArticles.length > 0) {
            await AxiosInstance.post(
              "/articles/saveArticlesFeed",
              { feed_id: feedId, articles: newArticles },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }

          setProgress(100); // Mark progress as complete
        } catch (error) {
          console.error("Error refreshing feed:", error);
          throw error; // This will trigger the toast error message
        } finally {
          setDisabledFeedId(null); // Enable the feed after processing
        }
      })(),
      {
        loading: "Refreshing feed...",
        success: "Feed updated successfully!",
        error: "Something went wrong. Try again.",
      }
    );
  };
  const deleteFeed = async (feedId) => {
    try {
      const token = getCookie("token"); // Get the token from cookies

      // Send DELETE request to the backend
      const response = await AxiosInstance.delete(`/feeds/${feedId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        // Optionally, update the UI by removing the deleted feed from the list
        refreshFeed();
        toast("Success!", {
          description: "Your action was completed successfully",
        });
        // If you're using a state to hold the feeds, you can filter it out here
        // Example: setFeeds(feeds.filter(feed => feed.id !== feedId));
      }
    } catch (error) {
      console.error("Error deleting feed:", error);
      toast.error("Error!", {
        description: "Something went wrong. Please try again.",
      });
      setError("Failed to delete the feed. Please try again.");
    }
  };
  const navMain = [
    {
      title: "Home",
      url: "/",
      items: [
        { title: "Articles", url: "/home", key: "001" },
        { title: "Archived Articles", url: "/home/archive", key: "002" },
      ],
    },
    {
      title: (
        <div className="flex mb-2 items-center justify-between w-full text-[18px]">
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
              <br />
              {disabledFeedId === feed.id && (
                <span className="loading-text disabled">Processing...</span>
              )}
            </div>
            <div className="flex gap-3">
              <BiRefresh
                onClick={(e) => {
                  e.preventDefault();
                  handleRefreshFeedOnly(feed.id, feed.url); // Pass feedId and feedUrl
                }}
              />
              <RxTrash
                className="delete-icon"
                onClick={(e) => {
                  e.preventDefault();
                  deleteFeed(feed.id);
                }}
              />
            </div>
          </>
        ),
        url: user ? `/feed/${user.id}/${feed.id}` : "/login",
      })),
    },

    // {
    //   title: "Settings",
    //   url: "/settings",
    //   items: [
    //     {
    //       title: "File Conventions",
    //       url: "/settings/file-conventions",
    //       key: "004",
    //     },
    //   ],
    // },
  ];

  return (
    <Sidebar className="sumanafont" {...props}>
      <SidebarHeader>
        <div className="flex justify-center text-center">
          <img className="w-32 h-16 object-cover" src="/logo-2.svg" alt="" />
        </div>
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
