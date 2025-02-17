"use client";
import { getCookie } from "cookies-next";
import { FiCheckSquare } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import AxiosInstance from "@/lib/axiosInstance";
export const AddFeed = ({
  feedUrl,
  setFeedUrl,
  progress,
  setProgress,
  disabledFeedId,
  setDisabledFeedId,
  setFeedId, // Destructure setFeedId here
  handleCompleteFeedProcess,
}) => {
  const [loading, setLoading] = useState(false);

  const handleProcessFeed = async (e) => {
    e.preventDefault();
    setLoading(true);
    await handleCompleteFeedProcess(feedUrl); // Call the parent's handleCompleteFeedProcess
  };

  return (
    <Dialog className="">
      <DialogTrigger asChild>
        <Button variant="outline" className="h-6">
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md z-index-top">
        <DialogHeader>
          <DialogTitle>Add feed</DialogTitle>
          <DialogDescription>it may take some time!</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)} // Update feedUrl state
              placeholder="Enter RSS feed URL"
            />
          </div>
          <Button
            onClick={handleProcessFeed}
            type="submit"
            size="sm"
            className="px-3"
            disabled={loading || disabledFeedId}
          >
            <span className="sr-only">submit</span>
            <FiCheckSquare />
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
