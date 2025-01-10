import React, { useEffect, useState } from "react";
import { CiStickyNote } from "react-icons/ci";
import { Textarea } from "@/components/ui/textarea";
import { useCallback } from "react";
import { getCookie } from "cookies-next";
import { v4 as uuidv4 } from "uuid";
import AxiosInstance from "@/lib/axiosInstance";
export const SelectMenu = ({
  saveArticleChanges,
  articleContent,
  articleId,
}) => {
  const [selection, setSelection] = useState(""); // The selected text
  const [position, setPosition] = useState(null); // Menu position
  const [clickedHighlight, setClickedHighlight] = useState(null); // Currently clicked highlight
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Popup state
  const [state, setState] = useState("");

  useEffect(() => {
    const handleMouseUp = () => {
      const activeSelection = document.getSelection();
      if (!activeSelection || !activeSelection.rangeCount) {
        setPosition(null);
        setSelection("");
        return;
      }

      const selectedText = activeSelection.toString().trim();
      if (selectedText) {
        const rect = activeSelection.getRangeAt(0).getBoundingClientRect();
        setSelection(selectedText);
        setPosition({
          x: rect.left + rect.width / 2 - 90, // Center the menu
          y: rect.top + window.scrollY - 45, // Position above the selection
        });
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleHighlightClick = (button) => {
    // Handle clicking an existing highlight
    const rect = button.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2 - 90, // Center the menu
      y: rect.top + window.scrollY - 45, // Position above the button
    });
    console.log("button clicked");
    setClickedHighlight(button); // Save the clicked highlight
    setSelection(button.textContent); // Display the text in the menu
  };
  const handleColorChange = (color) => {
    if (clickedHighlight) {
      clickedHighlight.className = `highlight-button  highlight-${color}`;
      setClickedHighlight(null);
      setPosition(null);
      const updatedContent =
        document.querySelector(".article_content").innerHTML;
      saveArticleChanges(updatedContent);
    } else {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      const selectedText = range.toString();

      if (!selectedText.trim()) return;

      const button = document.createElement("button");
      const uniqueId = uuidv4(); // Generate a unique UUID
      button.id = `highlight-${uniqueId}`; // Assign the unique ID to the button
      button.className = `highlight-button highlight-${color}`;
      button.textContent = selectedText;

      const span = document.createElement("span");
      const computedStyle = window.getComputedStyle(
        range.startContainer.parentNode
      );
      span.style.fontWeight = computedStyle.fontWeight;
      span.style.fontStyle = computedStyle.fontStyle;

      span.appendChild(button);
      button.addEventListener("click", () => handleHighlightClick(button));

      range.deleteContents();
      range.insertNode(span);

      const updatedContent =
        document.querySelector(".article_content").innerHTML;
      setSelection("");
      setPosition(null);

      // Call saveArticleChanges
      saveArticleChanges(updatedContent);
      saveHighlight(color, selectedText, articleId);
    }
  };
  const saveHighlight = async (color, text, articleId) => {
    try {
      const token = getCookie("token");
      const response = AxiosInstance.post(
        `/articles/${articleId}/highlights`,
        {
          highlighted_text: text,
          color: color,
          note: "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const savedHighlight = await response.json();
        console.log("Highlight saved:", savedHighlight);
      } else {
        console.error("Failed to save highlight", response.statusText);
      }
    } catch (error) {
      console.error("Error saving highlight:", error);
    }
  };

  useEffect(() => {
    const buttons = document.querySelectorAll(".highlight-button"); // Class of your buttons
    buttons.forEach((button) => {
      button.addEventListener("click", () => handleHighlightClick(button));
    });

    return () => {
      // Clean up listeners to prevent duplicates
      buttons.forEach((button) => {
        button.removeEventListener("click", () => handleHighlightClick(button));
      });
    };
  }, [articleContent]); // Re-run effect whenever `articleContent` changes

  return (
    <div>
      {/* Highlight Menu */}
      {position && selection !== "" && (
        <div
          className="            after:absolute after:top-full after:left-1/2 after:-translate-x-2 after:h-0 after:w-0 after:border-x-[6px] after:border-x-transparent after:border-b-[8px] after:border-b-black after:rotate-180"
          style={{
            position: "absolute",
            top: position.y,
            left: position.x,
            display: "flex",
            gap: "8px",
            background: "black",
            color: "white",
            padding: "8px",
            borderRadius: "4px",
          }}
        >
          <button
            onClick={() => handleColorChange("red")}
            className="w-[20px] h-[20px] bg-red-700 rounded-full"
          ></button>
          <button
            onClick={() => handleColorChange("orange")}
            className="w-[20px] h-[20px] bg-orange-600 rounded-full"
          ></button>
          <button
            onClick={() => handleColorChange("yellow")}
            className="w-[20px] h-[20px] bg-yellow-400 rounded-full"
          ></button>
          <button
            onClick={() => handleColorChange("blue")}
            className="w-[20px] h-[20px] bg-blue-500 rounded-full"
          ></button>
          <button
            onClick={() => handleColorChange("green")}
            className="w-[20px] h-[20px] bg-green-600 rounded-full"
          ></button>
          <button onClick={() => setIsPopupOpen(true)}>
            <CiStickyNote className="text-2xl" />
          </button>
        </div>
      )}

      {/* Popup Form */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-1/3 p-6">
            <h2 className="text-xl font-semibold mb-4">Add your note</h2>
            <Textarea
              placeholder="What do you think?"
              className="w-full h-32 mb-4 border rounded-lg p-2"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setIsPopupOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsPopupOpen(false);
                  handleColorChange("orange");
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
