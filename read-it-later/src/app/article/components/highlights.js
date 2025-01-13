"use client";
import { getCookie } from "cookies-next";
import React, { useState, useEffect } from "react";
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
        console.log(highlights);
      } catch (error) {
        console.error("Error saving highlight:", error);
      }
    };
    fetchHighlights();
  }, [articleContent]);

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle className="text-4xl">Highlights</SheetTitle>
        <div>
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
        </div>
      </SheetHeader>
    </SheetContent>
  );
};
