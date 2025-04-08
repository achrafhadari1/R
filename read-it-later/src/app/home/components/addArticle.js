"use client";

import React, { useState } from "react";
import { getCookie } from "cookies-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlusCircle, Loader2, Check, AlertCircle, X } from "lucide-react";
import AxiosInstance from "@/lib/axiosInstance";

export function AddArticle({ refreshArticles }) {
  const [url, setUrl] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (!validateUrl(url)) {
      setError("Please enter a valid URL");
      return;
    }

    setIsLoading(true);

    try {
      const token = getCookie("token");

      const response = await fetch("/api/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "Could not extract content from this URL"
            : "Failed to fetch article"
        );
      }

      const data = await response.json();

      await AxiosInstance.post(
        "/articles",
        {
          title: data.title,
          lead_image: data.lead_image_url,
          content: data.content,
          date_published: data.date_published,
          url: data.url,
          domain: data.domain,
          excerpt: data.excerpt,
          word_count: data.word_count,
          author: data.author,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      setUrl("");
      refreshArticles();

      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-4 z-50">
      {isOpen ? (
        <Card className="w-full max-w-md shadow-lg animate-in slide-in-from-bottom-5 duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              Add New Article
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Paste article URL here"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                  aria-label="Article URL"
                />
                {error && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="ml-2 text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="bg-green-50 text-green-800 border-green-200 py-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="ml-2 text-sm">
                      Article added successfully!
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !url.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Add Article</>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg"
          aria-label="Add article"
        >
          <PlusCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
