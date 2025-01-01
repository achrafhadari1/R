import React from "react";
import Link from "next/link";
export default function Landing() {
  return (
    <div>
      <button>
        <Link href="/register">register</Link>
        <Link href="/login">login</Link>
      </button>
    </div>
  );
}
