"use client";

import AxiosInstance from "@/lib/axiosInstance";
import { createContext, useEffect, useState } from "react";
import { getCookie } from "cookies-next";

export const AppContext = createContext();

export default function AppProvider({ children }) {
  const [token, setToken] = useState(getCookie("token"));
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true); // Add a loading state

  async function getUser() {
    try {
      const res = await AxiosInstance.get("/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;
      setUser(data); // Set the user data
      console.log("User data fetched:", data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false); // End loading state
    }
  }

  useEffect(() => {
    if (token) {
      getUser();
    } else {
      setLoading(false); // If no token, end loading immediately
    }
  }, [token]);

  return (
    <AppContext.Provider value={{ token, setToken, user, loading, setUser }}>
      {children}
    </AppContext.Provider>
  );
}
