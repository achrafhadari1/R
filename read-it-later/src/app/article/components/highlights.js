"use client";
import { getCookie } from "cookies-next";
import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import AxiosInstance from "@/lib/axiosInstance";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
export const Highlights = ({ id, articleContent }) => {
  const [highlights, sethighlights] = useState({});
  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const token = getCookie("token"); // Replace with your token retrieval logic
        const response = await AxiosInstance.get(
          `/articles/${id}/highlights`,

          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        sethighlights(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error saving highlight:", error);
      }
    };
    fetchHighlights();
  }, [articleContent]);

  return (
    <SheetContent aria-describedby={undefined}>
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
                  <span className="text-sm italic">Note: {highlight.note}</span>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </SheetHeader>
    </SheetContent>
  );
};
