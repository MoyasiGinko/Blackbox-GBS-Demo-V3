"use client";

import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Available AI/SEO Services</h1>
      </main>
    </>
  );
}
