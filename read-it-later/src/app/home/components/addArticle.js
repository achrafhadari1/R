import { useState } from "react";
import { getCookie } from "cookies-next";

import AxiosInstance from "../../../lib/axiosInstance";
export const AddArticle = ({ refreshArticles }) => {
  const [url, setUrl] = useState("");
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Reset state
    setError(null);

    try {
      const token = getCookie("token");

      const response = await AxiosInstance.post(
        "/parse",
        { url },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      // Check if the fetch request was successful
      if (!response.ok) {
        throw new Error("Failed to fetch article");
      }

      // Parse the response from the API
      const data = await response.json();
      // Get the article data
      setData(data); // Store the article data in state
      console.log(data);
      console.log();
      // Send the article data to your backend using axios
      const axiosResponse = await AxiosInstance.post(
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
      // Handle successful axios response (e.g., redirect or show success message)
      console.log("Article saved:", axiosResponse.data);
      refreshArticles();
    } catch (err) {
      // Handle errors (either from fetch or axios)
      setError(err.message);
    }
  };

  return (
    <div className="absolute flex-row-reverse w-28 flex right-3 bottom-5 home_svg_container">
      <div className="text-3xl svg_image z-10">
        <img src="/add-circle-svgrepo-com.svg" alt="Add Icon" />
      </div>

      {/* Add a form element to handle the submit */}
      <form onSubmit={handleSubmit} className="z-0 absolute addArticleForm">
        <input
          className="z-0 absolute addArticleInput"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Add URL"
        />
      </form>

      {/* Error Message Display */}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};
