"use client";

import { useState, useEffect, useRef } from "react";
import { SelectMenu } from "../components/selectMenu";
import AxiosInstance from "../../../lib/axiosInstance";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import "../../style/article.css";
import { Navbar } from "../components/navbar";
import { getCookie } from "cookies-next";
import debounce from "lodash.debounce";
import { motion } from "framer-motion";

export default function Article() {
  const params = useParams();
  const articleId = decodeURIComponent(params.articleId);
  const [article, setArticle] = useState(null);
  const [date, setDate] = useState("");
  const [id, title] = articleId.split("+");
  const [domain, setDomain] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const lastSentScrollRef = useRef(0);
  const scrollDataRef = useRef([]);
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
          setIsLoading(false);

          setTimeout(() => {
            restoreScrollPosition(response.data.article.progress - 10);
          }, 100);
        })
        .catch((error) => {
          console.error(error);
          setIsLoading(false);
        });
    }
  }, [id]);

  const restoreScrollPosition = (progress) => {
    if (progress > 0) {
      // Add a small delay before starting the scroll
      setTimeout(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        const targetPosition = (progress / 100) * scrollHeight;

        // Get current scroll position
        const startPosition =
          window.pageYOffset || document.documentElement.scrollTop;
        const distance = targetPosition - startPosition;

        // Custom smooth scroll with slower animation
        const duration = 2000; // Longer duration = slower scroll (in ms)
        let start = null;

        function step(timestamp) {
          if (!start) start = timestamp;
          const elapsed = timestamp - start;
          const progress = Math.min(elapsed / duration, 1);

          // Easing function for smoother animation
          const easeInOutCubic = (t) =>
            t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

          const easeProgress = easeInOutCubic(progress);

          window.scrollTo({
            top: startPosition + distance * easeProgress,
            behavior: "auto", // We're manually controlling the animation
          });

          if (elapsed < duration) {
            window.requestAnimationFrame(step);
          } else {
            // Update the last sent scroll position after animation completes
            lastSentScrollRef.current = progress;
          }
        }

        window.requestAnimationFrame(step);
      }, 500); // Delay before starting scroll (ms)
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

  // --------------- Scroll Tracking  ---------------

  useEffect(() => {
    const handleScroll = debounce(() => {
      const scrollTop = window.scrollY;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((scrollTop / scrollHeight) * 100);

      if (Math.abs(scrollPercentage - lastSentScrollRef.current) >= 10) {
        scrollDataRef.current.push(scrollPercentage);
        lastSentScrollRef.current = scrollPercentage; //
      }
    }, 500);

    window.addEventListener("scroll", handleScroll);

    const sendScrollDataInterval = setInterval(() => {
      const token = getCookie("token");

      if (scrollDataRef.current.length > 0 && token) {
        const lastProgress =
          scrollDataRef.current[scrollDataRef.current.length - 1]; //  Get last recorded progress

        if (lastProgress !== lastSentProgressRef.current) {
          console.log(lastProgress);
          AxiosInstance.put(
            `/article/${id}/progress`,
            { progress: lastProgress }, // Send only required field
            { headers: { Authorization: `Bearer ${token}` } }
          )
            .then(() => {
              lastSentProgressRef.current = lastProgress; //  Update last sent progress
              scrollDataRef.current = [];
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

  if (isLoading) {
    return (
      <div className="mt-10 articleConta flex w-4/5 m-auto flex-col">
        <div className="fixed left-0 top-0 h-full z-50 w-[5rem]">
          <div className="absolute inset-0 w-20 bg-gradient-to-b from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-900/70 backdrop-blur-sm border-r border-gray-200 dark:border-gray-800" />
          <div className="relative z-10 pt-8 flex justify-center">
            <Skeleton className="w-12 h-12 rounded-full" />
          </div>
          <div className="relative h-[70%] justify-center z-10 flex flex-col items-center gap-7 mt-auto mb-auto pt-32">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="w-10 h-10 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="space-y-2 relative">
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Skeleton className="h-12 w-3/4 mb-7" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          >
            <Skeleton className="h-8 w-2/4 mb-7" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative overflow-hidden"
        >
          <Skeleton className="h-[400px] rounded-xl mb-7" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
            }}
          />
        </motion.div>

        <div className="flex items-center gap-3 mb-7">
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          >
            <Skeleton className="h-6 w-6 rounded-full" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          >
            <Skeleton className="h-4 w-40" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          >
            <Skeleton className="h-4 w-24" />
          </motion.div>
        </div>

        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
            >
              <Skeleton className="h-4 w-full" />
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          >
            <Skeleton className="h-4 w-3/4" />
          </motion.div>

          <div className="py-4" />

          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i + 5}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 0.7, 0.5] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: (i + 5) * 0.1,
              }}
            >
              <Skeleton className="h-4 w-full" />
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
          >
            <Skeleton className="h-4 w-2/3" />
          </motion.div>

          <div className="py-2" />

          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            className="relative overflow-hidden"
          >
            <Skeleton className="h-[200px] rounded-lg mb-7" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
                delay: 0.5,
              }}
            />
          </motion.div>

          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i + 8}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 0.7, 0.5] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: (i + 10) * 0.1,
              }}
            >
              <Skeleton className="h-4 w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="articleConta flex w-4/5 m-auto flex-col"
      style={{ padding: "20px" }}
    >
      {article && (
        <div className="w-full">
          <Navbar
            id={id}
            is_from_feed={article.is_from_feed}
            articleContent={articleContent}
          />
          <h2 className="article_header">{article.title}</h2>

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
