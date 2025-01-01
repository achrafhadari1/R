"use client";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import AxiosInstance from "../../lib/axiosInstance";
import { setCookie } from "cookies-next";
import { AppContext } from "../Context/AppContext";

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
    setErrors({});
    try {
      // Make the API call
      const axiosResponse = await AxiosInstance.post("/login", formData);
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
        setErrors(err.response.data.errors.email[0]); // Set the validation errors
        console.log(errors); // Log the error response from the server
      } else {
        // Handle unexpected errors (like network issues)
        console.error("Unexpected error:", err.message);
      }
    }

    // Log form data
  }

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-6">
      <input
        type="text"
        placeholder="enter email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      {errors.email && <p className="error">{errors.errors.email[0]}</p>}{" "}
      <input
        type="password"
        placeholder="enter password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      {errors.password && <p className="error">{errors.password[0]}</p>}{" "}
      <button type="submit">login</button>
    </form>
  );
}
