import React from "react";
import { CiEdit } from "react-icons/ci";
import { IoArchiveOutline } from "react-icons/io5";
import { SlNotebook } from "react-icons/sl";
import { AiOutlineHome } from "react-icons/ai";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { DeleteArticle } from "@/app/home/components/deleteArticle";
import { Highlights } from "./highlights";

export const Navbar = ({ id, articleContent, fetchHighlights }) => {
  const router = useRouter();
  const gotoHome = () => {
    router.push(`/home`);
  };

  return (
    <>
      <div className="z-50 left-0 top-0 fixed w-16 flex justify-center pt-9 text-2xl">
        <Link href="/home">
          <AiOutlineHome />
        </Link>
      </div>

      <div className="left-0 top-0 fixed h-full w-16 m-auto flex justify-center align-middle">
        <div className="self-center flex flex-col gap-6 text-2xl">
          <CiEdit />
          <Sheet>
            <SheetTrigger onClick={fetchHighlights}>
              <SlNotebook />
            </SheetTrigger>
            <Highlights id={id} articleContent={articleContent} />
          </Sheet>
          <IoArchiveOutline />
          <DeleteArticle id={id} onDelete={gotoHome} />
        </div>
      </div>
    </>
  );
};
