"use client";
import { CiTrash } from "react-icons/ci";
import { CiGlobe } from "react-icons/ci";
import { DeleteArticle } from "./deleteArticle";
import { IoArchiveOutline } from "react-icons/io5";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCookie } from "cookies-next";
import { MdOutlineUnarchive } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import AxiosInstance from "@/lib/axiosInstance"; // Assuming AxiosInstance is already configured

import { toast } from "sonner";
export const ArticleContainerGrid = ({
  id,
  title,
  lead_image_url,
  date_published,
  domain,
  is_archived,
  author,
  progress,
  word_count,
  url,
  refreshArticles,
}) => {
  const router = useRouter();
  const [readingTime, setReadingTime] = useState(0);
  const [highlights, setHighlights] = useState([]);
  const [highlightCount, setHighlightCount] = useState(0);
  const [isArchived, setIsArchived] = useState(false); // Track archived status
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(true); // For tracking highlight loading state
  useEffect(() => {
    const averageReadingSpeed = 250;
    const time = Math.ceil(word_count / averageReadingSpeed);
    setReadingTime(time);
  }, [word_count]);

  useEffect(() => {
    // Fetch highlights for the article
    const fetchHighlights = async () => {
      try {
        const response = await AxiosInstance.get(`articles/${id}/highlights/`);
        setHighlights(response.data); // Assuming the API returns an array of highlights
        setHighlightCount(response.data.length); // Set the count of highlights
      } catch (error) {
        console.error("Error fetching highlights:", error);
      }
    };

    fetchHighlights();
  }, [id]);

  const gotoArticle = () => {
    const formattedTitle = title.replace(/\s+/g, "-").toLowerCase(); // Format the title for URL
    router.push(`/article/${id}+${formattedTitle}`);
  };

  const getMainDomain = () => {
    if (!domain) return "";
    return domain.replace(/^(www\.)?/, "").replace(/\.[a-z]{2,}$/i, "");
  };

  const mainDomain = getMainDomain(domain);

  const handleArchive = async () => {
    const token = getCookie("token");

    try {
      const response = await AxiosInstance.put(
        `/articles/${id}/archive`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Success toast
        toast.success("Success!", {
          description: "Your action was completed successfully",
        });
        refreshArticles(); // Refresh articles after archiving
      }
    } catch (error) {
      console.error("Error archiving article:", error);
      // Error toast
      toast.error("Error!", {
        description: "Something went wrong. Please try again.",
      });
    }
  };
  const unarchive = async () => {
    const token = getCookie("token");

    try {
      const response = await AxiosInstance.put(
        `/articles/${id}/unarchive`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Success toast
        toast.success("Success!", {
          description: "Your action was completed successfully",
        });
        refreshArticles(); // Refresh articles after unarchiving
      }
    } catch (error) {
      console.error("Error unarchiving the article:", error);
      // Error toast
      toast.error("Error!", {
        description: "Something went wrong. Please try again.",
      });
    }
  };
  return (
    <div className="relative w-64 flex flex-col ArticleContainerSingle">
      <img
        className="h-48 object-cover lead_image"
        src={lead_image_url}
        alt="lead_image"
      />
      {progress > 0 && (
        <div
          className="bg-yellow-400 h-[5px] -translate-y-[0.3rem] transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      )}
      <div
        onClick={gotoArticle}
        className="absolute w-full h-full hidden popuptogo"
      >
        <div className="h-48 w-full flex justify-center align-middle">
          <img className="w-8" src="/arrow-up-right-svgrepo-com.svg" alt="" />
        </div>
      </div>
      <div className="flex z-50 items-baseline justify-between">
        <div className=" w-[10rem] authorusw py-4 pl-2 pr-1 text-sm h-8">
          {author || mainDomain.toUpperCase()}
        </div>
        <div className=" py-4 pr-2 h-8">
          {highlightCount > 0 && (
            <Sheet>
              <SheetTrigger>
                <div className="text-sm authorusw cursor-pointer hover:text-red-700">
                  {highlightCount} Highlight{highlightCount !== 1 ? "s" : ""}
                </div>
              </SheetTrigger>
              <SheetContent className="z-high " aria-describedby={undefined}>
                <SheetHeader className="overflow-auto">
                  <SheetTitle className="text-4xl">Highlights</SheetTitle>
                  <ScrollArea className="h-full w-full rounded-md ">
                    {Object.entries(highlights).map(([id, highlight]) => (
                      <div className="flex" key={id}>
                        <div
                          className="article-highlight-navbar-tiny-thing-color"
                          style={{ backgroundColor: highlight.color }}
                        ></div>{" "}
                        <div className=" w-full highlight-item flex flex-col items-start p-2  rounded-md shadow-sm bg-gray-50 mb-3">
                          <span className="text-xl  text-gray-800">
                            {highlight.highlighted_text}
                          </span>
                          {highlight.note && (
                            <span className="text-sm italic">
                              Note: {highlight.note}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
      <div className="p-4 title-article-home">{title}</div>
      <div className="p-4 flex justify-between title-article-home-bottom">
        <div className="flex gap-4">
          {url ? (
            <a target="_blank" href={url}>
              <CiGlobe className="go-to-original" />
            </a>
          ) : (
            <CiGlobe className="go-to-original disabled" />
          )}

          {is_archived === 0 ? (
            <button onClick={handleArchive}>
              <IoArchiveOutline
                className={`go-to-original ${
                  is_archived ? "text-yellow-500" : "text-gray-500"
                }`}
              />
            </button>
          ) : (
            <button onClick={unarchive}>
              <MdOutlineUnarchive
                className={`go-to-original ${
                  is_archived ? "text-yellow-500" : "text-gray-500"
                }`}
              />
            </button>
          )}

          <DeleteArticle refreshArticles={refreshArticles} id={id} />
        </div>

        <div className="self-center">{readingTime} min</div>
      </div>

      {/* Display Highlight Count and make it clickable to open a modal */}
    </div>
  );
};
