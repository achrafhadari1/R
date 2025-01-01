"use client";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { AppContext } from "@/app/Context/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useContext } from "react";
import AxiosInstance from "@/lib/axiosInstance";

export function NavUser() {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { user, token, setUser, setToken } = useContext(AppContext);

  async function handleLogout(e) {
    e.preventDefault();
    console.log("Token:", token);

    try {
      const res = await AxiosInstance.post(
        "/logout",
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Logout response:", res);
      setUser(null); // Clear user state
      setToken(null);
      router.push(`/login`); // Clear token state
      deleteCookie("token"); // Delete token cookie
      // Redirect to home page
    } catch (error) {
      console.error("Error during logout:", error.response || error.message);
    }
  }
  return (
    <>
      {user && (
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={
                        user.avatar ||
                        "https://upload.wikimedia.org/wikipedia/commons/0/0c/Freddie_Mercury_%281975_Elektra_publicity_photo%29.jpg"
                      }
                      alt={user.name || "User"}
                    />{" "}
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user.name || "Unknown User"}
                    </span>
                    <span className="truncate text-xs">
                      {user.email || "No email provided"}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={
                          user.avatar ||
                          "https://upload.wikimedia.org/wikipedia/commons/0/0c/Freddie_Mercury_%281975_Elektra_publicity_photo%29.jpg"
                        }
                        alt={user.name || "User"}
                      />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user.name || "Unknown User"}
                      </span>
                      <span className="truncate text-xs">
                        {user.email || "No email provided"}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Sparkles />
                    Themes
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheck />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard />
                    Feeds
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell />
                    Feedback
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      )}
    </>
  );
}
