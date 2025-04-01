"use client";
import React, { useState, useEffect } from "react";
import AxiosInstance from "@/lib/axiosInstance";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import "../../../style/feed.css";
import { FaArrowRightLong } from "react-icons/fa6";
import { format } from "date-fns";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/app-sidebar";

export default function Feed() {
  const router = useRouter();
  const params = useParams();
  const id = decodeURIComponent(params.feedName); // Decode the feedId from the URL
  const [articles, setArticles] = useState([]);
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true); // Add a loading state
  const randomNumber = Math.floor(Math.random() * 6) + 1;

  // Fetch articles when the component mounts
  useEffect(() => {
    if (id) {
      fetchArticles(id);
      fetchFeed(id);
    }
  }, [id]);

  const gotoArticle = (title, articleId) => {
    const formattedTitle = title.replace(/\s+/g, "-").toLowerCase(); // Format the title
    router.push(`/article/${articleId}+${formattedTitle}`); // Navigate to the article page
  };

  const fetchArticles = async (feedId) => {
    try {
      const token = getCookie("token"); // Get the authentication token from cookies
      const response = await AxiosInstance.get(`/feeds/${feedId}/articles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const sortedArticles = response.data.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });

      console.log(sortedArticles);
      setArticles(sortedArticles);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  const fetchFeed = async (feedId) => {
    try {
      const token = getCookie("token");
      const response = await AxiosInstance.get(`/feeds/${feedId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFeedData(response.data); // Set articles state with the fetched data
      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error("Error fetching feed data:", error);
    }
  };
  const groupArticlesByDate = (articles) => {
    return articles.reduce((acc, article) => {
      const formattedDate = article.created_at
        ? format(new Date(article.created_at), "MMMM d, yyyy")
        : "Unknown Date";

      if (!acc[formattedDate]) {
        acc[formattedDate] = [];
      }
      acc[formattedDate].push(article);
      return acc;
    }, {});
  };
  const filteredArticles = articles.slice(6);
  // Grouped articles
  const groupedArticles = groupArticlesByDate(filteredArticles);

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedArticles).sort(
    (a, b) => new Date(b) - new Date(a)
  );
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 hide-this-shit items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {/* Breadcrumb skeleton */}
                {loading ? (
                  <Skeleton className="w-32 h-4" />
                ) : (
                  <>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink className="ubuntu-regular" href="#">
                        Feeds
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-[1.2rem] ubuntu-medium">
                        {feedData.title}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          {/* Skeleton for feed content */}
          <div className="navbar flex justify-center items-center w-4/5 ml-auto mr-auto mb-16">
            <div className="gap-4 flex flex-col">
              <hr />
              {/* Title Skeleton */}
              {loading ? (
                <Skeleton className="w-60 h-8 mb-2" />
              ) : (
                <div className="text-6xl text-center authorusw_title">
                  {feedData.title}
                </div>
              )}
              {/* Description Skeleton */}
              {loading ? (
                <Skeleton className="w-96 h-4 mb-2" />
              ) : (
                <div className="text-center authorusw red">
                  {feedData.description}
                </div>
              )}
              {/* Date Skeleton */}
              {loading ? (
                <Skeleton className="w-40 h-4 mb-2" />
              ) : (
                <div className="text-center">
                  {articles.length > 0 ? (
                    new Date(articles[0].created_at).toLocaleDateString("de-DE") // Format: DD.MM.YYYY
                  ) : (
                    <Skeleton className="w-60 h-8 mb-2" />
                  )}
                </div>
              )}
              <div className="double-border w-full "></div>
            </div>
          </div>

          {/* Articles Section */}
          <div className="flex w-[94%] ml-auto mr-auto containerfeed gap-8 mb-8">
            {/* Left Column: First two articles */}
            <div className="flex flex-col w-3/12 left_side_feed">
              {loading ? (
                <Skeleton className="h-40 mb-4" />
              ) : (
                articles.slice(1, 3).map((article, index) => {
                  // Assign a unique random number for missing images
                  const randomNumber = Math.floor(Math.random() * 6) + 1;

                  return (
                    <div
                      key={article.id || index}
                      className="article article_2"
                    >
                      <hr />
                      <div className="flex pt-4 pb-4">
                        <div className="image-left-width">
                          <div className="title_article_small">
                            {article.title}
                          </div>
                          <div className="excerpt_article_small">
                            {article.excerpt}
                          </div>
                          <div
                            onClick={() =>
                              gotoArticle(article.title, article.id)
                            }
                            className="cursor-pointer flex w-3/4 bg-black text-white p-2 mt-4 justify-around items-center"
                          >
                            <button className="pb-1 text-[20px]">Read</button>
                            <FaArrowRightLong className="cursor-pointer" />
                          </div>
                        </div>
                        <div>
                          <img
                            className="w-40 h-32 object-cover"
                            src={article.lead_image}
                            alt="article image"
                            onError={(e) => {
                              e.target.onerror = null; // Prevent infinite loop
                              e.target.src = `/no_image/no_${randomNumber}.jpg`;
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Center Column: Main article */}
            <div className="article article_1 p-4 w-6/12 border border-black">
              {loading ? (
                <Skeleton className="h-96 w-full mb-4" />
              ) : (
                articles[0] && (
                  <>
                    <img
                      className="h-96 object-cover w-full"
                      src={articles[0].lead_image}
                      alt="article image"
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = `/no_image/no_${randomNumber}.jpg`;
                      }}
                    />
                    <Badge className="mt-2 red text-[14px]" variant="outline">
                      Recent
                    </Badge>
                    <div
                      onClick={() =>
                        gotoArticle(articles[0].title, articles[0].id)
                      }
                      className="main-article-title text-3xl font-normal authorusw_title"
                    >
                      {articles[0].title}
                    </div>
                    <div className="excerpt">{articles[0].excerpt}</div>
                  </>
                )
              )}
            </div>

            {/* Right Column: Last two articles */}
            <div className="flex flex-col w-3/12 left_side_feed justify-between">
              {loading ? (
                <Skeleton className="h-32 mb-4" />
              ) : (
                articles.slice(3, 6).map((article, index) => (
                  <div key={index} className="article article_4">
                    <hr />
                    <div className="flex justify-between pt-4">
                      <div
                        onClick={() => gotoArticle(article.title, article.id)}
                        className="title_article_small"
                      >
                        {article.title}
                      </div>
                      <img
                        className="w-40 h-32 object-cover article_feed_small_right"
                        src={article.lead_image}
                        alt="article image"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* by day */}
          <div className="w-[94%] ml-auto mr-auto mt-9 gap-8 mb-8">
            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              sortedDates.map((date, idx) => (
                <div key={idx}>
                  {/* Date Header */}
                  <div className="authorusw_title mb-6 text-[2rem] red">
                    {date}
                  </div>

                  <div className="grid grid-cols-6 containerfeed2 gap-8 justify-between">
                    {groupedArticles[date].map((article, index) => (
                      <div key={index} className="flex flex-col">
                        {/* Article Image */}
                        <img
                          src={
                            article.lead_image ||
                            `/no_image/no_${
                              Math.floor(Math.random() * 10) + 1
                            }.jpg`
                          }
                          alt="article image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `/no_image/no_${
                              Math.floor(Math.random() * 10) + 1
                            }.jpg`;
                          }}
                        />

                        {/* Article Content */}
                        <div className="flex flex-col mt-4 justify-start gap-4">
                          <div
                            onClick={() =>
                              gotoArticle(article.title, article.id)
                            }
                            className="title_shyata cursor-pointer"
                          >
                            {article.title}
                          </div>
                          <div className="text-gray-700 text-xl">
                            {article.excerpt ||
                              "This article has no description."}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
