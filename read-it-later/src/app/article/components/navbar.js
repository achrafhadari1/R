"use client";

import { useState } from "react";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import AxiosInstance from "@/lib/axiosInstance";
import { DeleteArticle } from "@/app/home/components/deleteArticle";
import { Highlights } from "./highlights";
import { cn } from "@/lib/utils";

// Add these imports instead
import { Home, Archive, Trash, Check, Plus, BookOpen } from "lucide-react";
import { MdOutlineUnarchive } from "react-icons/md";

export const Navbar = ({
  id,
  is_from_feed,
  articleContent,
  is_archived,
  fetchHighlights,
}) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [isArticleArchived, setIsArticleArchived] = useState(is_archived);

  const router = useRouter();
  const gotoHome = () => {
    router.push(`/home`);
  };

  const handleRemoveFromFeed = async () => {
    setIsRemoving(true); // Trigger animation

    try {
      const token = getCookie("token");

      const response = await AxiosInstance.put(
        `/articles/${id}/remove-from-feed`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setTimeout(() => {
          setIsRemoved(true); // Fade out after animation
        }, 1000); // Adjust timing for animation effect
        toast.success("Success!", {
          description: "Your action was completed successfully",
        });
      }
    } catch (error) {
      console.error("Error updating is_from_feed:", error);
      toast.error("Error!", {
        description: "Something went wrong. Please try again.",
      });
    }
  };

  const handleArchive = async () => {
    const token = getCookie("token");

    try {
      const response = await AxiosInstance.put(
        `/articles/${id}/archive`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setIsArticleArchived(1);
        // You can add toast notification here if you have a toast component
        toast.success("Success!", {
          description: "Your action was completed successfully",
        });
      }
    } catch (error) {
      console.error("Error archiving article:", error);
      toast.error("Error!", {
        description: "Something went wrong. Please try again.",
      });
      // You can add error toast here
    }
  };

  const handleUnarchive = async () => {
    const token = getCookie("token");

    try {
      const response = await AxiosInstance.put(
        `/articles/${id}/unarchive`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setIsArticleArchived(0);
        toast.success("Success!", {
          description: "Your action was completed successfully",
        });
        // You can add toast notification here if you have a toast component
      }
    } catch (error) {
      console.error("Error unarchiving the article:", error);
      toast.error("Error!", {
        description: "Something went wrong. Please try again.",
      });
      // You can add error toast here
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        className="fixed left-0 w-[5rem] top-0 h-full z-50 flex flex-col items-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Glass effect background */}
        <div className="absolute inset-0 w-20 bg-gradient-to-b from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-900/70 backdrop-blur-sm border-r border-gray-200 dark:border-gray-800" />

        {/* Home icon at top */}
        <div className="relative z-10 pt-8 pb-12">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/home">
                <motion.div
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Home size={22} strokeWidth={2} />
                </motion.div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              <p>Home</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main navigation items */}
        <div className="relative z-10 flex flex-col items-center gap-7 mt-auto mb-auto">
          {/* Add to feed button - only shown when applicable */}
          {is_from_feed === 1 && !isRemoved && (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg",
                    "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
                    "transition-all duration-300"
                  )}
                  onClick={handleRemoveFromFeed}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <AnimatePresence mode="wait">
                    {isRemoving ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Check
                          className="text-green-500"
                          size={22}
                          strokeWidth={2.5}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="plus"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 0 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Plus size={22} strokeWidth={2} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                <p>Add to Home Page</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Highlights button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Sheet>
                <SheetTrigger asChild>
                  <motion.button
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-lg",
                      "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
                      activeItem === "highlights" &&
                        "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                      "transition-all duration-200"
                    )}
                    onClick={fetchHighlights}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <BookOpen size={22} strokeWidth={2} />
                  </motion.button>
                </SheetTrigger>
                <Highlights id={id} articleContent={articleContent} />
              </Sheet>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              <p>Highlights</p>
            </TooltipContent>
          </Tooltip>

          {/* Archive button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg",
                  "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
                  "transition-all duration-200"
                )}
                onClick={
                  isArticleArchived === 0 ? handleArchive : handleUnarchive
                }
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isArticleArchived === 0 ? (
                  <Archive size={22} strokeWidth={2} />
                ) : (
                  <MdOutlineUnarchive size={22} className="text-yellow-500" />
                )}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              <p>{isArticleArchived === 0 ? "Archive" : "Unarchive"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Delete button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg",
                  "text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400",
                  "transition-all duration-200"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <DeleteArticle
                  id={id}
                  onDelete={gotoHome}
                  icon={
                    <Trash
                      className="text-[1.5rem]"
                      size={22}
                      strokeWidth={2}
                    />
                  }
                />
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              <p>Delete</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Bottom decoration */}
        <div className="relative z-10 w-full h-16 flex items-center justify-center">
          <motion.div
            className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700"
            animate={{
              width: [10, 20, 10],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        </div>
      </motion.div>
    </TooltipProvider>
  );
};
