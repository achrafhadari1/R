"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchForm } from "@/components/search-form";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import { AppContext } from "../app/Context/AppContext";
import AxiosInstance from "@/lib/axiosInstance";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import { AddFeed } from "@/app/home/components/addFeed";
import { getCookie } from "cookies-next";

export function AppSidebar({ ...props }) {
  const { user, loading } = useContext(AppContext);
  const router = useRouter();
  const pathname = usePathname();
  const [activePath, setActivePath] = useState("");
  const [feeds, setFeeds] = useState([]);
  const [progress, setProgress] = useState(0);
  const [disabledFeedId, setDisabledFeedId] = useState(null);
  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const token = getCookie("token");
        const response = await AxiosInstance.get("/feeds", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const fetchedFeeds = response.data.map((feed) => ({
          id: feed.id,
          title: feed.feed_url, // Displayed title
          // Dynamic link
        }));

        setFeeds(fetchedFeeds); // Store feeds in state
        console.log(fetchedFeeds);
      } catch (error) {
        console.error("Error fetching feeds:", error);
      }
    };

    fetchFeeds();
    console.log(feeds);
  }, []);
  const refreshFeed = async () => {
    try {
      const token = getCookie("token");
      const response = await AxiosInstance.get("/feeds", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedFeeds = response.data.map((feed) => ({
        id: feed.id,
        title: feed.feed_url, // Displayed title
        // Dynamic link
      }));

      setFeeds(fetchedFeeds); // Store feeds in state
    } catch (error) {
      console.error("Error fetching feeds:", error);
    }
  };
  useEffect(() => {
    // Update active path when pathname changes
    setActivePath(pathname);
  }, [pathname]);

  const navMain = [
    {
      title: "Home",
      url: "/",
      items: [
        { title: "Articles", url: "/home", key: "001" },
        { title: "Archived Articles", url: "/archived-articles", key: "002" },
        { title: "Highlights", url: "/highlights", key: "003" },
      ],
    },
    {
      title: (
        <div className="flex items-center justify-between w-full">
          Feeds{" "}
          <AddFeed
            refreshFeed={refreshFeed}
            setProgress={setProgress}
            setDisabledFeedId={setDisabledFeedId}
          />
        </div>
      ),
      url: "/feeds",
      items: feeds.map((feed) => ({
        key: feed.id, // Unique key for each feed
        title: (
          <div
            className={`feed-item ${
              disabledFeedId === feed.id ? "disabled" : ""
            }`}
            style={{
              pointerEvents: disabledFeedId === feed.id ? "none" : "auto", // Disable interaction
            }}
          >
            <span>{feed.title}</span>
            {disabledFeedId === feed.id && (
              <span className="loading-text disabled ">Processing...</span>
            )}
          </div>
        ),
        url: `/feed/${user.id}/${feed.id}`, // Feed URL with user ID and feed ID
      })),
    },

    {
      title: "Settings",
      url: "/settings",
      items: [
        {
          title: "File Conventions",
          url: "/settings/file-conventions",
          key: "004",
        },
      ],
    },
  ];

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex justify-center text-center">
          <img className="w-32 h-16 object-cover" src="/logo-2.svg" alt="" />
        </div>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>
              {group.title /* This now supports JSX */}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  // Determine if the item is active
                  const isActive = pathname === item.url;

                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <a href={item.url}>{item.title}</a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
