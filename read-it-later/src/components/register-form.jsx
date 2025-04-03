import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import AxiosInstance from "@/lib/axiosInstance";
import { setCookie } from "cookies-next";
import { AppContext } from "../app/Context/AppContext";
export function RegisterForm({ className, ...props }) {
  const { setToken } = useContext(AppContext);

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const router = useRouter();
  async function handleRegister(e) {
    e.preventDefault(); // Prevent form submission

    try {
      // Make the API call
      const axiosResponse = await AxiosInstance.post("/register", formData);
      console.log(axiosResponse.data); // Log the successful response data

      // Only proceed with setting the token if the registration is successful
      if (axiosResponse.data.token) {
        setCookie("token", axiosResponse.data.token, {
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });
        setToken(axiosResponse.data.token);
        router.push("/home");
      }
    } catch (err) {
      if (err.response) {
        // If the error has a response, it's likely from the API
        setErrors(err.response.data.errors);
        console.log("Unexpected error:", err.message);
        // Set the validation errors (assuming the API returns `errors`)
      } else {
        // Handle unexpected errors (like network issues)
        console.error("Unexpected error:", err.message);
      }
    }

    console.log("Form Data:", formData); // Log form data
  }
  return (
    <form
      onSubmit={handleRegister}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Register</h1>
        <p className="text-balance text-sm text-zinc-500 dark:text-zinc-400">
          Enter your email below to login to your account
        </p>

        {
          Object.keys(errors).length === 1 ? (
            // If there's exactly one error, display it
            Object.keys(errors).map((key) => (
              <p
                key={key}
                className="text-balance text-sm text-red-700 dark:text-zinc-400"
              >
                {errors[key][0]}
              </p>
            ))
          ) : Object.keys(errors).length > 1 ? (
            // If there are multiple errors, display a message
            <p className="text-balance text-sm text-red-700 dark:text-zinc-400">
              Too many errors
            </p>
          ) : null // If there are no errors, render nothing
        }
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="LATR"
            required
            className={errors.name ? "border-red-700 border " : "normal"}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={formData.email}
            className={errors.email ? "border-red-700 border " : "normal"}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input
            id="password"
            type="password"
            className={errors.password ? "border-red-700 border " : "normal"}
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Password Confirmation</Label>
          <Input
            id="password_confirmation"
            type="password"
            className={errors.password ? "border-red-700 border " : "normal"}
            required
            onChange={(e) =>
              setFormData({
                ...formData,
                password_confirmation: e.target.value,
              })
            }
          />
        </div>
        <Button type="submit" className="w-full">
          Sign Up
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?
        <a href="/login" className="underline underline-offset-4 pl-1">
          Sign in
        </a>
      </div>
    </form>
  );
}
