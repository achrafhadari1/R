import React from "react";
import { CiTrash } from "react-icons/ci";
import AxiosInstance from "../../../lib/axiosInstance";
import { getCookie } from "cookies-next";
import { useToast } from "@/hooks/use-toast";
import { Trash } from "lucide-react";

export const DeleteArticle = ({ id, refreshArticles, onDelete, icon }) => {
  const { toast } = useToast();
  const handleDelete = () => {
    const token = getCookie("token");

    console.log(`Attempting to delete article with ID: ${id}`);

    AxiosInstance.delete(`/articles/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        console.log("Server response:", response.data);

        let articleDeleted = false;

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("articles_")) {
            const storedArticles = JSON.parse(
              localStorage.getItem(key) || "[]"
            );

            const updatedArticles = storedArticles.filter(
              (article) => article.id !== Number(id)
            );

            if (updatedArticles.length !== storedArticles.length) {
              articleDeleted = true;
              localStorage.setItem(key, JSON.stringify(updatedArticles));
              console.log(`Updated ${key} saved to localStorage`);
            }
          }
        }

        if (!articleDeleted) console.warn("Article was not found in any feed.");

        refreshArticles?.();
        onDelete?.();

        console.log("Showing toast...");
        toast({
          title: "Delete Article",
          description: "Article deleted successfully",
        });
      })
      .catch((error) => {
        console.error(
          "Delete request failed:",
          error.response?.data || error.message
        );

        console.log("Showing error toast...");
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request.",
        });
      });
  };

  return (
    <div className="cursor-pointer delete-icon icon" onClick={handleDelete}>
      {icon || <CiTrash />} {/* Use the passed icon or default to Trash */}
    </div>
  );
};
