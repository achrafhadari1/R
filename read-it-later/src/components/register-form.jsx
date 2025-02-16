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

        {Object.keys(errors).length === 1 ? (
          // If there's exactly one error, display it
          Object.keys(errors).map((key) => (
            <p
              key={key}
              className="text-balance text-sm text-red-700 dark:text-zinc-400"
            >
              {errors[key][0]}
            </p>
          ))
        ) : (
          // If there are multiple errors, display a message
          <p className="text-balance text-sm text-red-700 dark:text-zinc-400">
            Too many errors
          </p>
        )}
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="Acme"
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
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-zinc-200 dark:after:border-zinc-800">
          <span className="relative z-10 bg-white px-2 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
            Or continue with
          </span>
        </div>
        <Button variant="outline" className="w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 24">
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 3.22 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 1.606-.015 2.896-.015 3.286 .315.21.69.825.57C20.565 22.092 24 17.592 12.297c0-6.627-5.373-12-12-12"
              fill="currentColor"
            />
          </svg>
          Login with GitHub
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?
        <a href="/login" className="underline underline-offset-4">
          Sign in
        </a>
      </div>
    </form>
  );
}
