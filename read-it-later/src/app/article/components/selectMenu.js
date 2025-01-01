import React, { useEffect, useState } from "react";
import { CiStickyNote } from "react-icons/ci";
import { Textarea } from "@/components/ui/textarea";

export const SelectMenu = () => {
  const [selection, setSelection] = useState("");
  const [state, setState] = useState("");
  const [position, setPosition] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const handleSelectStart = () => {
      setState("selecting");
      setSelection(undefined);
    };

    const handleMouseUp = () => {
      const activeSelection = document.getSelection();
      if (!activeSelection) return;

      const text = activeSelection.toString();
      if (!text) {
        setState("ready");
        setSelection(undefined);
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
    setIsPopupOpen(true);
    console.log(isPopupOpen);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const highlightText = (color) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement("span");

    span.className = `highlight-${color}`;
    span.textContent = range.toString();

    range.deleteContents();
    range.insertNode(span);
    setSelection(""); // Reset the selection state
    setState("ready"); // Reset the state to "ready"
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
            onClick={() => highlightText("red")}
            className="w-[20px] h-[20px] highlight_colors red bg-red-700 rounded-full"
          ></button>
          <button
            onClick={() => highlightText("orange")}
            className="w-[20px] h-[20px] highlight_colors bg-orange-600 rounded-full"
          ></button>
          <button
            onClick={() => highlightText("yellow")}
            className="w-[20px] h-[20px] highlight_colors bg-yellow-400 rounded-full"
          ></button>
          <button
            onClick={() => highlightText("blue")}
            className="w-[20px] h-[20px] highlight_colors bg-blue-500 rounded-full"
          ></button>
          <button
            onClick={() => highlightText("green")}
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
                  highlightText("orange");
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
