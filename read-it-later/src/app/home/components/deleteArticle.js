import React from "react";
import { CiTrash } from "react-icons/ci";
import AxiosInstance from "../../../lib/axiosInstance";
import { getCookie } from "cookies-next";
import { Trash } from "lucide-react";
import { toast } from "sonner";

export const DeleteArticle = ({ id, refreshArticles, onDelete, icon }) => {
  const handleDelete = () => {
    const token = getCookie("token");

    AxiosInstance.delete(`/articles/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
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

        refreshArticles?.();
        onDelete?.();
        toast.success("Success!", {
          description: "Your action was completed successfully",
        });
      })
      .catch((error) => {
        console.error(
          "Delete request failed:",
          error.response?.data || error.message
        );

        toast.error("Error!", {
          description: "Something went wrong. Please try again.",
        });
      });
  };

  return (
    <div className="cursor-pointer delete-icon icon" onClick={handleDelete}>
      {icon || <CiTrash />} {/* Use the passed icon or default to Trash */}
    </div>
  );
};
