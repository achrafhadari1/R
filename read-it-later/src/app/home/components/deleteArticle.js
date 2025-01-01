import React from "react";
import { CiTrash } from "react-icons/ci";
import AxiosInstance from "../../../lib/axiosInstance";
import { getCookie } from "cookies-next";

export const DeleteArticle = ({ id, refreshArticles, onDelete }) => {
  const handleDelete = () => {
    const token = getCookie("token");

    AxiosInstance.delete(`/articles/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log(response.data);
        if (refreshArticles) {
          refreshArticles();
        } // Process the response data
        if (onDelete) {
          onDelete();
        }
      })
      .catch((error) => {
        console.error(error); // Handle any errors
      });
  };
  return (
    <div className="cursor-pointer delete-icon icon">
      <CiTrash className="cursor-pointer" onClick={handleDelete} />
    </div>
  );
};
