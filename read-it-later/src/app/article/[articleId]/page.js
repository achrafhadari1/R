"use client"; // This makes the component a client component

import { useState, useEffect } from "react";
import { SelectMenu } from "../components/selectMenu";
import AxiosInstance from "../../../lib/axiosInstance";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import "../../style/article.css";
import { Navbar } from "../components/navbar";
import { getCookie } from "cookies-next";

export default function Article() {
  const params = useParams();
  const articleId = decodeURIComponent(params.articleId); // Decode the URL-encoded articleId
  const [article, setArticle] = useState(null); // Article data
  const [date, setDate] = useState("");
  const [id, title] = articleId.split("+"); // Split into ID and title
  const [domain, setdomain] = useState("");
  useEffect(() => {
    const token = getCookie("token");
    if (id) {
      // Ensure ID exists before proceeding
      AxiosInstance.get(`/articles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }) // Fetch article data by ID
        .then((response) => {
          setArticle(response.data.article);
          // Update state with fetched article
          if (response.data.article.date_published) {
            const formattedDate = format(
              new Date(response.data.article.date_published), // Access date_published from the response data
              "MMM do, yyyy h:mm a"
            );
            setDate(formattedDate);
          }

          setdomain(getMainDomain(response.data.article.domain));
        })
        .catch((error) => {
          console.error(error); // Handle any errors
        });
    }
  }, [id]); // Re-run effect when ID changes
  const getMainDomain = (domain) => {
    if (!domain) return "";
    return domain
      .replace(/^(www\.)?/, "")
      .replace(/\.[a-z]{2,}$/i, "")
      .toUpperCase();
  };
  if (!article)
    return (
      <div className="mt-10 articleConta flex w-4/5 m-auto flex-col">
        <div className="space-y-2">
          {" "}
          <Skeleton className="h-20  w-2/4 mb-7 " />
        </div>
        <Skeleton className="h-[500px] rounded-xl mb-7" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3 mb-7" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4  w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4  w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4  w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4  w-full" />
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
          <Navbar id={id} />
          <h2 className="article_header">{article.title}</h2>

          <img
            src={article.lead_image || "default-image-url.jpg"} // Fallback in case `lead_image_url` is undefined
            alt="Article Lead"
            className="w-full mt-8 mb-8 rounded-2xl"
            style={{ maxWidth: "100%", height: "auto" }}
          />
          <div>
            <div className="mt-8 mb-8">
              Written by {article.author || domain} on {date || "Unknown"}{" "}
            </div>
          </div>

          <div
            className="text-3xl article_content relative"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
          <SelectMenu />
        </div>
      )}
    </div>
  );
}
