"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchForm } from "@/components/search-form";
import { usePathname } from "next/navigation";
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
const data = {
  navMain: [
    {
      title: "Home",
      url: "/",
      items: [
        { title: "Articles", url: "/home" },
        { title: "Archived Articles", url: "/archived-articles" },
        { title: "Highlights", url: "/highlights" },
      ],
    },
    {
      title: "Feeds",
      url: "/feeds",
      items: [{ title: "Bild", url: "/feeds/bild" }],
    },
    {
      title: "Settings",
      url: "/settings",
      items: [
        { title: "Add Feeds", url: "/settings/add-feeds" },
        { title: "File Conventions", url: "/settings/file-conventions" },
      ],
    },
  ],
};

export function AppSidebar({ ...props }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ActivePath, setActivePath] = useState("");
  useEffect(() => {
    // Update active path when pathname changes
    setActivePath(pathname);
  }, [pathname]);
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="text-center">LOGO</div>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  // Determine if the item is active
                  const isActive = pathname === item.url;

                  return (
                    <SidebarMenuItem key={item.title}>
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
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
