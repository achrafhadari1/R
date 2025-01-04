import React, { useEffect, useState } from "react";
import { CiStickyNote } from "react-icons/ci";
import { Textarea } from "@/components/ui/textarea";

export const SelectMenu = () => {
  const [selection, setSelection] = useState(""); // Store selected text
  const [state, setState] = useState(""); // Manage selection state
  const [position, setPosition] = useState({}); // Position of the selection for positioning the menu
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Manage popup state
  const [highlightedButton, setHighlightedButton] = useState(null); // Currently selected button for color change
  const [clickedHighlight, setClickedHighlight] = useState(null); // Store all highlights (array of highlight objects)
  const [highlights, setHighlights] = useState([]); // Store all highlights (array of highlight objects)
  useEffect(() => {
    const handleSelectStart = () => {
      setState("selecting");
      setSelection(""); // Reset selection state when a new selection starts
    };

    const handleMouseUp = () => {
      const activeSelection = document.getSelection();
      if (!activeSelection) return;

      const text = activeSelection.toString();
      if (!text) {
        setState("ready");
        setSelection(""); // Reset if no text is selected
        return;
      }

      const rect = activeSelection.getRangeAt(0).getBoundingClientRect();
      setSelection(text);
      setPosition({
        x: rect.left + rect.width / 2 - 180 / 2,
        y: rect.top + window.scrollY - 45,
        width: rect.width,
        height: rect.height,
      });
      setState("selected");
    };

    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const openPopup = () => {
    setIsPopupOpen(true); // Open the note popup
  };

  const closePopup = () => {
    setIsPopupOpen(false); // Close the note popup
  };

  const handleHighlightClick = (button, color) => {
    // Position the menu based on the button's position
    const rect = button.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2 - 180 / 2,
      y: rect.top + window.scrollY - 45,
      width: rect.width,
      height: rect.height,
    });

    // Save the button in the state
    setClickedHighlight(button); // Save the button element

    setSelection(button.textContent); // Update the selection text
    setState("selected"); // Set state to selected

    // Apply the color change immediately
    if (button) {
      // Log the button directly
      console.log("button clicked is", button);
      button.className = `highlight-${color}`; // Apply the color change immediately
    }
  };

  const highlightText = (color, button = null) => {
    if (button) {
      console.log("button clicked");

      // Directly apply color change to the clicked button
      button.className = `highlight-${color}`;
      return; // Exit early after applying the color change
    }

    // If no button is passed, handle new text selection
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (!selectedText.trim()) return; // Ensure there's valid text

    // Create a new button for the highlighted text
    const span = document.createElement("button");
    const uniqueId = `highlight-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    span.id = uniqueId;
    span.className = `highlight-${color}`;
    span.textContent = selectedText;

    // Add an event listener to this button
    span.addEventListener("click", () => handleHighlightClick(span, color));

    range.deleteContents();
    range.insertNode(span);

    // Track the new highlight in state
    setHighlights((prev) => [
      ...prev,
      { id: uniqueId, color: color, text: selectedText },
    ]);

    setSelection(""); // Reset selection
    setState("ready"); // Reset state to ready
  };

  return (
    <div>
      {state === "selected" && selection && position && (
        <div
          style={{
            transform: `translate3d(${position.x}px,${position.y}px, 0)`,
          }}
          className="z-50 absolute top-0 left-0 w-[180px] h-[35px] justify-center items-center flex gap-2 bg-black text-white rounded
          after:absolute after:top-full after:left-1/2 after:-translate-x-2 after:h-0 after:w-0 after:border-x-[6px] after:border-x-transparent after:border-b-[8px] after:border-b-black after:rotate-180"
        >
          <button
            onClick={() => highlightText("red", highlightedButton)}
            className="w-[20px] h-[20px] highlight_colors red bg-red-700 rounded-full"
          ></button>
          <button
            onClick={() => highlightText("orange", highlightedButton)}
            className="w-[20px] h-[20px] highlight_colors bg-orange-600 rounded-full"
          ></button>
          <button
            onClick={() => highlightText("yellow", highlightedButton)}
            className="w-[20px] h-[20px] highlight_colors bg-yellow-400 rounded-full"
          ></button>
          <button
            onClick={() => highlightText("blue", highlightedButton)}
            className="w-[20px] h-[20px] highlight_colors bg-blue-500 rounded-full"
          ></button>
          <button
            onClick={() => highlightText("green", highlightedButton)}
            className="w-[20px] h-[20px] highlight_colors bg-green-600 rounded-full"
          ></button>
          <button onClick={openPopup}>
            <CiStickyNote className="text-2xl highlight_note cursor-pointer" />
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
                onClick={closePopup}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  closePopup();
                  highlightText("orange"); // Save note with orange highlight
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
