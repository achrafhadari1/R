import React, { useEffect, useState } from "react";
import { CiStickyNote } from "react-icons/ci";
import { Textarea } from "@/components/ui/textarea";
import { useCallback } from "react";
import { getCookie } from "cookies-next";
import { MdOutlineSpeakerNotes } from "react-icons/md";
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
  const [savedSelectionRange, setSavedSelectionRange] = useState(null); // Save the selection range
  useEffect(() => {
    const handleMouseUp = () => {
      const targetElement = document.querySelector(".articleConta");
      if (!targetElement) return; // Ensure the target element exists

      // Get the selection
      const activeSelection = window.getSelection();
      if (
        !activeSelection ||
        !activeSelection.rangeCount ||
        !targetElement.contains(activeSelection.anchorNode)
      ) {
        setPosition(null);
        setSelection("");
        return;
      }

      const selectedText = activeSelection.toString().trim();
      if (selectedText) {
        const range = activeSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setSelection(selectedText);
        setPosition({
          x: rect.left + rect.width / 2 - 90, // Center the menu
          y: rect.top + window.scrollY - 45, // Position above the selection
        });
        setSavedSelectionRange(range.cloneRange());
      }
    };

    const targetElement = document.querySelector(".articleConta");
    if (targetElement) {
      targetElement.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      if (targetElement) {
        targetElement.removeEventListener("mouseup", handleMouseUp);
      }
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

  const handleColorChange = async (color) => {
    if (clickedHighlight) {
      clickedHighlight.className = `highlight-button highlight-${color}`;
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

      const span = document.createElement("span");
      const button = document.createElement("span");

      const computedStyle = window.getComputedStyle(
        range.startContainer.parentNode
      );
      span.style.fontWeight = computedStyle.fontWeight;
      span.style.fontStyle = computedStyle.fontStyle;

      button.className = `highlight-button highlight-${color}`;
      button.textContent = selectedText;

      span.appendChild(button);
      button.addEventListener("click", () => handleHighlightClick(button));

      range.deleteContents();
      range.insertNode(span);

      try {
        const token = getCookie("token"); // Replace with your token retrieval logic
        const response = await AxiosInstance.post(
          `/articles/${articleId}/highlights`,
          {
            color,
            highlighted_text: selectedText,
            article_id: articleId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 201) {
          const { id: highlightId } = response.data;

          // Assign the returned ID to the highlight span
          button.id = `highlight-${highlightId}`;
        } else {
          console.error("Failed to save highlight:", response.statusText);
        }
      } catch (error) {
        console.error("Error saving highlight:", error);
      }

      const updatedContent =
        document.querySelector(".article_content").innerHTML;
      setSelection("");
      setPosition(null);

      // Call saveArticleChanges
      saveArticleChanges(updatedContent);
    }
  };

  const saveHighlight = async (color, text, articleId, note) => {
    try {
      const token = getCookie("token");
      const response = await AxiosInstance.post(
        `/articles/${articleId}/highlights`,
        {
          highlighted_text: text,
          color: color,
          note: note || "",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Error saving highlight:", error);
    }
  };

  useEffect(() => {
    // Attach event listeners to highlight buttons
    const buttons = document.querySelectorAll(".highlight-button"); // Class of your buttons
    buttons.forEach((button) => {
      button.addEventListener("click", () => handleHighlightClick(button));
    });

    // Attach event listeners to note icons
    const notes = document.querySelectorAll(".note-icon");
    notes.forEach((note) => {
      note.addEventListener("click", async (event) => {
        event.stopPropagation(); // Prevent click from triggering parent events
        console.log("Note clicked");
        // Fetch the associated highlight ID
        const highlightSpan = note.closest(".highlight-button");
        console.log(`Highlight ID: ${highlightSpan}`);
        if (highlightSpan && highlightSpan.id) {
          const highlightId = highlightSpan.id.split("-")[1]; // Extract the ID part
          console.log(`Highlight ID: ${highlightId}`);

          // Fetch the note data
          const token = getCookie("token");
          try {
            const response = await AxiosInstance.get(
              `/articles/highlights/${highlightId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (response.status === 200) {
              const { note: savedNote } = response.data;
              setState(savedNote); // Pre-fill the textarea with the note
              setIsPopupOpen(true); // Re-open the popup
              console.log(savedNote);
            } else {
              console.error("Failed to fetch note:", response.statusText);
            }
          } catch (error) {
            console.error("Error fetching note:", error);
          }
        } else {
          console.error("Highlight ID not found");
        }
      });
    });

    return () => {
      // Clean up listeners to prevent duplicates
      buttons.forEach((button) => {
        button.removeEventListener("click", () => handleHighlightClick(button));
      });

      notes.forEach((note) => {
        note.removeEventListener("click", (event) => event.stopPropagation());
      });
    };
  }, [articleContent]);
  // Re-run effect whenever `articleContent` changes
  const restoreSelection = () => {
    if (savedSelectionRange) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelectionRange); // Restore the saved range
    }
  };
  const handleSaveNote = async (color, note) => {
    restoreSelection();
    if (clickedHighlight) {
      const highlightId = clickedHighlight.id.replace("highlight-", ""); // Extract the highlight ID

      try {
        const token = getCookie("token"); // Replace with your token retrieval logic
        const response = await AxiosInstance.put(
          `/articles/highlights/${highlightId}/note`,
          { note },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const noteIcon = document.createElement("span");
        noteIcon.className = "note-icon";
        noteIcon.innerHTML = `<svg stroke="currentColor" class="highlight-with-note" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="200px" width="200px" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17l-.59.59-.58.58V4h16v12zM6 12h2v2H6zm0-3h2v2H6zm0-3h2v2H6zm4 6h5v2h-5zm0-3h8v2h-8zm0-3h8v2h-8z"></path></svg>`;
        noteIcon.style.marginLeft = "5px";
        noteIcon.style.cursor = "pointer";
        clickedHighlight.appendChild(noteIcon);
        const updatedContent =
          document.querySelector(".article_content").innerHTML;
        saveArticleChanges(updatedContent);
        if (response.status === 200) {
          console.log("Note updated successfully!");
          // Optionally update the UI if needed
        } else {
          console.error("Failed to update note:", response.statusText);
        }
      } catch (error) {
        console.error("Error updating note:", error);
      }

      // Reset the popup state
      setSelection("");
      setPosition(null);
      setIsPopupOpen(false);
      setState("");
      return; // Exit since we're updating, not creating
    }
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (!selectedText.trim()) return;

    // Create a wrapper span for the highlight
    const wrapperSpan = document.createElement("span");

    // Create the highlight span
    const highlightSpan = document.createElement("span");
    highlightSpan.className = `highlight-button highlight-${color}`;
    highlightSpan.textContent = selectedText;

    // Create the note icon
    const noteIcon = document.createElement("span");
    noteIcon.className = "note-icon";
    noteIcon.innerHTML = `<svg stroke="currentColor" class="highlight-with-note" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="200px" width="200px" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17l-.59.59-.58.58V4h16v12zM6 12h2v2H6zm0-3h2v2H6zm0-3h2v2H6zm4 6h5v2h-5zm0-3h8v2h-8zm0-3h8v2h-8z"></path></svg>`;
    noteIcon.style.marginLeft = "5px";
    noteIcon.style.cursor = "pointer";

    // Append highlight and note icon to the wrapper span
    wrapperSpan.appendChild(highlightSpan);
    highlightSpan.appendChild(noteIcon);

    // Insert the wrapper span into the document
    range.deleteContents();
    range.insertNode(wrapperSpan);

    // Save the highlight and note to the database
    try {
      const token = getCookie("token"); // Replace with your token retrieval logic
      const response = await AxiosInstance.post(
        `/articles/${articleId}/highlights`,
        {
          color,
          highlighted_text: selectedText,
          article_id: articleId,
          note,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        const { id: highlightId } = response.data;

        // Assign the returned ID to the highlight span
        highlightSpan.id = `highlight-${highlightId}`;

        // Add a click listener to re-open the note popup
        noteIcon.addEventListener("click", async () => {
          try {
            const noteResponse = await AxiosInstance.get(
              `/articles/highlights/${highlightId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (noteResponse.status === 200) {
              const { note: savedNote } = noteResponse.data;
              setState(savedNote); // Pre-fill the textarea with the note
              setIsPopupOpen(true); // Re-open the popup
            } else {
              console.error("Failed to fetch note:", noteResponse.statusText);
            }
          } catch (error) {
            console.error("Error fetching note:", error);
          }
        });
      } else {
        console.error("Failed to save highlight:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving highlight:", error);
    }

    // Update the article content and save it
    const updatedContent = document.querySelector(".article_content").innerHTML;
    saveArticleChanges(updatedContent);

    // Reset the selection and popup
    setSelection("");
    setPosition(null);
    setIsPopupOpen(false);
  };

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
              required
              placeholder="What do you think?"
              value={state} // Pre-fill with the current note
              onChange={(e) => setState(e.target.value)} // Update state on change
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
                  handleSaveNote("orange", state); // Pass the selected color and note text
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
