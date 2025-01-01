"use client";
import React, { useEffect, useState } from "react";
import "../style/home.css";
import { AddArticle } from "./components/addArticle";
import { ArticleContainerGrid } from "./components/ArticleContainerGrid";
import AxiosInstance from "../../lib/axiosInstance";
import { getCookie } from "cookies-next";
import { format } from "date-fns";
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
  // Fetch articles when the component mounts
  useEffect(() => {
    const token = getCookie("token");

    AxiosInstance.get("/articles", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log(response.data); // Process the response data
        setArticles(response.data); // Update state with fetched articles
      })
      .catch((error) => {
        console.error(error); // Handle any errors
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
        setArticles(response.data); // Update state with the latest articles
      })
      .catch((error) => {
        console.error(error); // Handle any errors
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
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Articles</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="home-container">
          <div className="ml-4 flex-wrap mt-2 flex div2home">
            {articles.length > 0 ? (
              articles.map((article) => {
                // Format the date_published before passing it as a prop
                const formattedDate = format(
                  new Date(article.date_published),
                  "MMM do, yyyy h:mm a"
                );

                return (
                  <ArticleContainerGrid
                    key={article.id}
                    id={article.id}
                    title={article.title}
                    lead_image_url={article.lead_image} // Ensure this key matches with your API response
                    url={article.url} // Make sure your response includes this URL
                    date_published={formattedDate} // Pass the formatted date
                    domain={article.domain}
                    author={article.author}
                    word_count={article.word_count}
                    refreshArticles={refreshArticles}
                  />
                );
              })
            ) : (
              <p>no posts</p>
            )}
            <AddArticle refreshArticles={refreshArticles} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
