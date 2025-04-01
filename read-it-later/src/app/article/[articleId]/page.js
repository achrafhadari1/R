"use client"; // Ensures the component runs on the client-side

import { useState, useEffect, useRef } from "react";
import { SelectMenu } from "../components/selectMenu";
import AxiosInstance from "../../../lib/axiosInstance";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import "../../style/article.css";
import { Navbar } from "../components/navbar";
import { getCookie } from "cookies-next";
import debounce from "lodash.debounce"; // Import lodash debounce

export default function Article() {
  const params = useParams();
  const articleId = decodeURIComponent(params.articleId);
  const [article, setArticle] = useState(null);
  const [date, setDate] = useState("");
  const [id, title] = articleId.split("+");
  const [domain, setDomain] = useState("");
  const [articleContent, setArticleContent] = useState("");

  const lastSentScrollRef = useRef(0);
  const scrollDataRef = useRef([]); // Stores batched scroll data
  const lastSentProgressRef = useRef(null);
  useEffect(() => {
    const token = getCookie("token");
    if (id) {
      AxiosInstance.get(`/articles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          setArticle(response.data.article);
          if (response.data.article.date_published) {
            const formattedDate = format(
              new Date(response.data.article.date_published),
              "MMM do, yyyy h:mm a"
            );
            setDate(formattedDate);
          }
          setDomain(getMainDomain(response.data.article.domain));
          setArticleContent(response.data.article.content);

          // ✅ Restore scroll position based on progress
          setTimeout(() => {
            restoreScrollPosition(response.data.article.progress - 10);
          }, 100);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [id]);
  const restoreScrollPosition = (progress) => {
    if (progress > 0) {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollPosition = (progress / 100) * scrollHeight;

      window.scrollTo({ top: scrollPosition, behavior: "smooth" });

      // ✅ Delay before enabling scroll tracking (without triggering re-render)
      setTimeout(() => {
        lastSentScrollRef.current = progress; // ✅ Use ref instead of state
      }, 3000);
    }
  };

  const getMainDomain = (domain) => {
    if (!domain) return "";
    return domain
      .replace(/^(www\.)?/, "")
      .replace(/\.[a-z]{2,}$/i, "")
      .toUpperCase();
  };

  const saveArticleChanges = async (updatedContent) => {
    const token = getCookie("token");
    const data = {
      title: article.title,
      content: updatedContent || articleContent,
      lead_image: article.lead_image,
      date_published: article.date_published,
      author: article.author,
      domain: article.domain,
    };

    try {
      const response = await AxiosInstance.put(`/articles/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Article updated successfully", response.data);
      setArticleContent(updatedContent);
    } catch (error) {
      console.error("Error updating article", error);
    }
  };

  // --------------- Scroll Tracking Optimization ---------------

  useEffect(() => {
    const handleScroll = debounce(() => {
      const scrollTop = window.scrollY;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((scrollTop / scrollHeight) * 100);

      if (Math.abs(scrollPercentage - lastSentScrollRef.current) >= 10) {
        scrollDataRef.current.push(scrollPercentage);
        lastSentScrollRef.current = scrollPercentage; // ✅ Update ref instead of state
      }
    }, 500); // Debounce for 500ms

    window.addEventListener("scroll", handleScroll);

    // Send batched data every 5 seconds
    const sendScrollDataInterval = setInterval(() => {
      const token = getCookie("token");

      if (scrollDataRef.current.length > 0 && token) {
        const lastProgress =
          scrollDataRef.current[scrollDataRef.current.length - 1]; // ✅ Get last recorded progress

        if (lastProgress !== lastSentProgressRef.current) {
          console.log(lastProgress);
          AxiosInstance.put(
            `/article/${id}/progress`,
            { progress: lastProgress }, // ✅ Send only required field
            { headers: { Authorization: `Bearer ${token}` } }
          )
            .then(() => {
              lastSentProgressRef.current = lastProgress; // ✅ Update last sent progress
              scrollDataRef.current = []; // ✅ Clear batch after sending
            })
            .catch((error) => console.error("Scroll tracking failed", error));
        }
      }
    }, 3000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(sendScrollDataInterval);
    };
  }, [id]);

  // -----------------------------------------------------------

  if (!article)
    return (
      <div className="mt-10 articleConta flex w-4/5 m-auto flex-col">
        <div className="space-y-2">
          <Skeleton className="h-12  w-2/4 mb-7 " />
        </div>
        <Skeleton className="h-[500px] rounded-xl mb-7" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/3 mb-7" />
        </div>
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );

  return (
    <div
      className="articleConta flex w-4/5 m-auto flex-col"
      style={{ padding: "20px" }}
    >
      {article && (
        <div className="  w-full">
          <Navbar id={id} articleContent={articleContent} />
          <h2 className="article_header ">{article.title}</h2>

          <img
            src={article.lead_image || "default-image-url.jpg"}
            alt="Article Lead"
            className="w-full mt-8 mb-8 rounded-2xl"
            style={{ maxWidth: "100%", height: "auto" }}
          />
          <div>
            <div className="red authorusw mt-8 mb-8">
              Written by {article.author || domain} on {date || "Unknown"}
            </div>
          </div>

          <div
            className="text-3xl article_content relative"
            dangerouslySetInnerHTML={{ __html: articleContent }}
          />
          <SelectMenu
            articleContent={articleContent}
            setArticleContent={setArticleContent}
            saveArticleChanges={saveArticleChanges}
            articleId={id}
          />
        </div>
      )}
    </div>
  );
}
