"use client";

import React from "react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-black text-white px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link href="/">AI/SEO Services</Link>
      </div>
      <div className="space-x-4"></div>
    </nav>
  );
}
