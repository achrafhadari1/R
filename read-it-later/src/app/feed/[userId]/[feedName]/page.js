"use client";
import React, { useState, useEffect } from "react";
import AxiosInstance from "@/lib/axiosInstance";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";

import { useParams } from "next/navigation";
export default function Feed() {
  const router = useRouter();
  const params = useParams();
  const id = decodeURIComponent(params.feedName);
  const [articles, setArticles] = useState([]);
  // Fetch articles when the component mounts
  useEffect(() => {
    if (id) {
      fetchArticles(id);
    }
  }, [id]);
  const gotoArticle = (title, id) => {
    const formattedTitle = title.replace(/\s+/g, "-").toLowerCase(); // Replace spaces with dashes and make lowercase
    router.push(`/article/${id}+${formattedTitle}`);
  };
  const fetchArticles = async (feedId) => {
    try {
      const token = getCookie("token"); // Assuming you have a getCookie function
      const response = await AxiosInstance.get(`/feeds/${feedId}/articles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setArticles(response.data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">
          Seeking Fresh Faces And Undiscovered Talents.
        </h1>
        <p className="text-gray-500 mt-4">
          We represent models who embody grace, poise, and a magnetic presence
          that captivates audiences around the world.
        </p>
        <button className="mt-6 px-6 py-3 bg-black text-white rounded hover:bg-gray-800">
          Meet Our Models
        </button>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {articles.map((article) => (
          <div
            key={article.id}
            className="relative rounded overflow-hidden shadow-lg bg-white"
          >
            <img
              src={article.lead_image || "/placeholder.jpg"}
              alt={article.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 text-xs uppercase rounded">
              {article.tag || "Top Model"}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold">{article.title}</h3>
              <p className="text-gray-500 mt-2">{article.excerpt}</p>
            </div>
            <div onClick={() => gotoArticle(article.title, article.id)}>
              go to article
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
