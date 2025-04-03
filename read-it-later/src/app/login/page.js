"use client";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import AxiosInstance from "../../lib/axiosInstance";
import { setCookie } from "cookies-next";
import { AppContext } from "../Context/AppContext";
import { GalleryVerticalEnd } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function Login() {
  const { setToken } = useContext(AppContext);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault(); // Prevent form submission
    setErrors({}); // Reset previous errors
    try {
      // Make the API call
      const axiosResponse = await AxiosInstance.post("/login", formData);
      console.log("Login Success Response: ", axiosResponse.data); // Log the successful response data

      // Only proceed with setting the token if the login is successful
      if (axiosResponse.data.token) {
        setCookie("token", axiosResponse.data.token, {
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });
        setToken(axiosResponse.data.token);
        router.push("/home");
      }
    } catch (err) {
      // Log a user-friendly error message without showing the full error object
      if (err.response) {
        // If the error has a response, it's likely from the API
        const errorData = err.response.data.errors;

        // Log only the error message instead of the full error object
        console.log("API Error Response:", errorData);

        // Update the state with the received errors to display on screen
        setErrors(errorData);
      } else {
        // Log the error message for unexpected errors (network issues, etc.)
        console.error("Unexpected error:", err.message);
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="flex flex-col gap-6 mx-auto max-w-sm w-full p-6 bg-white rounded-lg ">
        <form onSubmit={handleLogin}>
          <div className="flex flex-col gap-6">
            {/* Logo and Title */}
            <div className="flex flex-col items-center gap-2">
              <a
                href="#"
                className="flex flex-col items-center gap-2 font-medium"
              >
                <div className="flex h-40 w-40 items-center justify-center rounded-md">
                  <img src="/logo-2.svg" className="w-full h-full" alt="" />
                </div>
                <span className="sr-only">Acme Inc.</span>
              </a>
              <h1 className="text-xl font-bold">Welcome to LATR Inc.</h1>
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <a href="/register" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>

            {/* Email and Password Fields */}
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email[0]}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password[0]}</p>
                )}
              </div>

              {/* Login Button */}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </div>
        </form>

        {/* Terms and Privacy */}
        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
          By clicking continue, you agree to our{" "}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
}
