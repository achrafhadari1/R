"use client";
import { CiTrash } from "react-icons/ci";
import { CiGlobe } from "react-icons/ci";
import { DeleteArticle } from "./deleteArticle";
import { IoArchiveOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
export const ArticleContainerGrid = ({
  id,
  title,
  lead_image_url,
  date_published,
  domain,
  author,
  word_count,
  url,
  refreshArticles,
}) => {
  const router = useRouter();
  const [readingTime, setReadingTime] = useState(0);
  useEffect(() => {
    const averageReadingSpeed = 250;

    // Calculate reading time and round up
    const time = Math.ceil(word_count / averageReadingSpeed);
    setReadingTime(time);
  }, [word_count]);

  const gotoArticle = () => {
    const formattedTitle = title.replace(/\s+/g, "-").toLowerCase(); // Replace spaces with dashes and make lowercase
    router.push(`/article/${id}+${formattedTitle}`);
  };
  const getMainDomain = () => {
    if (!domain) return "";
    return domain.replace(/^(www\.)?/, "").replace(/\.[a-z]{2,}$/i, "");
  };
  const mainDomain = getMainDomain(domain);

  return (
    <div className="relative w-64 flex flex-col gap-3 ArticleContainerSingle">
      <img
        className="h-48 object-cover lead_image"
        src={lead_image_url}
        alt="lead_image"
      />
      <div
        onClick={gotoArticle}
        className="absolute w-full h-full hidden popuptogo"
      >
        <div className="h-48 w-full flex justify-center align-middle">
          <img className="w-8" src="/arrow-up-right-svgrepo-com.svg" alt="" />
        </div>
      </div>
      <div className=" p-4 text-sm h-8">
        {author || mainDomain.toUpperCase()}
      </div>
      <div className="p-4 title-article-home">{title}</div>
      <div className="p-4 flex justify-between title-article-home-bottom">
        <div className="flex gap-4">
          {url ? (
            <a target="_blank" href={url}>
              <CiGlobe className="go-to-original" />
            </a>
          ) : (
            <CiGlobe className="go-to-original disabled" /> // Add a disabled class or placeholder
          )}

          <IoArchiveOutline className="go-to-original" />

          <DeleteArticle refreshArticles={refreshArticles} id={id} />
        </div>

        <div className="self-center">{readingTime} min</div>
      </div>
    </div>
  );
};
