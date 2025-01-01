"use client";

import { RegisterForm } from "@/components/register-form";
export default function Register() {
  return (
    // <form onSubmit={handleRegister} className="flex flex-col gap-6">
    //   <input
    //     type="text"
    //     placeholder="enter username"
    //     value={formData.name}
    //     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    //   />
    //   {errors.name && <p className="error">{errors.name[0]}</p>}{" "}
    //   <input
    //     type="text"
    //     placeholder="enter email"
    //     value={formData.email}
    //     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    //   />
    //   {errors.email && <p className="error">{errors.email[0]}</p>}{" "}
    //   <input
    //     type="password"
    //     placeholder="enter password"
    //     value={formData.password}
    //     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
    //   />
    //   {errors.password && <p className="error">{errors.password[0]}</p>}{" "}
    // <input
    //   type="password"
    //   placeholder="confirm password"
    //   value={formData.password_confirmation}
    //   onChange={(e) =>
    //     setFormData({ ...formData, password_confirmation: e.target.value })
    //   }
    // />
    //   {errors.password && <p className="error">{errors.password[0]}</p>}{" "}
    //   <button type="submit">register</button>
    // </form>

    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              {/* <GalleryVerticalEnd className="size-4" /> */}
            </div>
            Acme Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <RegisterForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
