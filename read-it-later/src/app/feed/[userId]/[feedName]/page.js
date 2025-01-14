"use client";
import React, { useState, useEffect } from "react";
import AxiosInstance from "@/lib/axiosInstance";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import "../../../style/feed.css";
import { FaArrowRightLong } from "react-icons/fa6";

export default function Feed() {
  const router = useRouter();
  const params = useParams();
  const id = decodeURIComponent(params.feedName); // Decode the feedId from the URL

  const [articles, setArticles] = useState([]);

  // Fetch articles when the component mounts
  useEffect(() => {
    if (id) {
      fetchArticles(id);
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

      setArticles(response.data); // Set articles state with the fetched data
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  return (
    <>
      <div className="navbar flex justify-between items-center">
        <a href="/home">
          <img src="/logo-2.svg" className="w-40" alt="" />
        </a>
        <div className="mr-32">
          <hr />
          <div className="text-6xl">PITCHFORK</div>
          <div className="text-center">13.12.2025</div>
          <hr />
        </div>
        <div></div>
      </div>
      <div className="flex w-4/5 ml-auto mr-auto mb-16 containerfeed gap-8 ">
        {/* Left Column: First two articles */}
        <div className="flex flex-col w-3/12">
          {articles.slice(1, 3).map((article, index) => (
            <div key={index} className="article article_2">
              <hr />
              <div className="flex pt-4 pb-4 ">
                <div className="image-left-width">
                  <div className="title_article_small">{article.title}</div>
                  <div className="excerpt_article_small">{article.excerpt}</div>
                  <div className="flex w-3/4 bg-black text-white p-2 mt-4 justify-around items-center">
                    <button
                      className="pb-1"
                      onClick={() => gotoArticle(article.title, article.id)}
                    >
                      read more
                    </button>
                    <FaArrowRightLong />
                  </div>
                </div>
                <div>
                  <img
                    className="w-40 h-32 object-cover"
                    src={article.lead_image}
                    alt="article image"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Center Column: Main article */}
        <div className="article article_1 p-4 w-6/12 border border-black">
          {articles[0] && (
            <>
              <img
                className="h-96 object-cover w-full"
                src={articles[0].lead_image}
                alt="big first article image"
              />
              <Badge className="mt-2" variant="outline">
                Recent
              </Badge>
              <div className="main-article-title text-3xl font-normal">
                {articles[0].title}
              </div>
              <div className="excerpt">{articles[0].excerpt}</div>
            </>
          )}
        </div>

        {/* Right Column: Last two articles */}
        <div className="flex flex-col w-3/12 justify-between">
          {articles.slice(3, 6).map((article, index) => (
            <div key={index} className="article article_4">
              <hr />
              <div className="flex justify-between pt-4">
                <div className="title_article_small">{article.title}</div>
                <img
                  className="w-40 h-32 object-cover article_feed_small_right"
                  src={article.lead_image}
                  alt="article image"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
