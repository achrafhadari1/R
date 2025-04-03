"use client";

import React, { useEffect, useState } from "react";
import "../../style/home.css";
import { AddArticle } from "../components/addArticle";
import { ArticleContainerGrid } from "../components/ArticleContainerGrid";
import AxiosInstance from "@/lib/axiosInstance";
import { RiArrowDownDoubleFill } from "react-icons/ri";
import { getCookie } from "cookies-next";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

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
export default function Home() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Fetch articles when the component mounts
  useEffect(() => {
    const token = getCookie("token");

    AxiosInstance.get("/articles", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        const filteredArticles = response.data.filter(
          (article) => article.is_from_feed === 0 && article.is_archived === 1
        );

        console.log(filteredArticles); // Log the filtered articles
        setArticles(filteredArticles);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error); // Handle any errors
        setIsLoading(false);
      });
  }, []);
  // Empty dependency array to run this only once when the component mounts
  const refreshArticles = () => {
    const token = getCookie("token");
    // Fetch the updated articles after deletion
    AxiosInstance.get("/articles", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        const filteredArticles = response.data.filter(
          (article) => article.is_from_feed === 0 && article.is_archived === 1
        );

        setArticles(filteredArticles);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false); // Handle any errors
      });
  };
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 hide-this-shit items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink className="ubuntu-regular" href="/home">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[1.2rem] ubuntu-medium">
                  Archived Articles
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="home-container">
          <div className="ml-12 gap-2 flex-wrap mt-2 flex div2home">
            {isLoading ? (
              // Show skeleton loader while fetching data
              <div className="ml-12 flex-wrap mt-2 flex gap-3 div2home">
                <div className="relative w-64 flex flex-col gap-3 ArticleContainerSingle">
                  <Skeleton className="h-48 object-cover rounded-xl mb-7" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3 mb-2" />
                  </div>
                  <Skeleton className="h-4 w-2/4 mb-7" />
                  <div className="flex justify-between items-center space-y-2">
                    <div className="flex gap-4">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            ) : articles.length > 0 ? (
              // Render the articles if available
              articles.map((article) => {
                const formattedDate = format(
                  new Date(article.date_published),
                  "MMM do, yyyy "
                );

                return (
                  <ArticleContainerGrid
                    key={article.id}
                    id={article.id}
                    title={article.title}
                    lead_image_url={article.lead_image}
                    url={article.url}
                    date_published={formattedDate}
                    domain={article.domain}
                    progress={article.progress}
                    author={article.author}
                    word_count={article.word_count}
                    refreshArticles={refreshArticles}
                    is_archived={article.is_archived}
                  />
                );
              })
            ) : (
              // No articles found, show a cute message
              <>
                <div className="text-center mt-10 text-lg text-gray-500">
                  <p>No archived Articles!</p>
                  <p className="mt-2 text-sm text-gray-400">
                    You can start by archiving some of your old articles.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
