"use client";

import Image from "next/image";
import { useEffect } from "react";

export default function LoadingScreen() {
  useEffect(() => {
    const handleDOMContentLoaded = () => {
      const loader = document.getElementById("loading-screen");
      if (loader) {
        loader.style.opacity = "0"; // Optional fade-out effect
        setTimeout(() => loader.remove(), 500); // Remove after fade-out
      }
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);
    } else {
      handleDOMContentLoaded();
    }

    return () => {
      document.removeEventListener("DOMContentLoaded", handleDOMContentLoaded);
    };
  }, []);

  return (
    <div
      id="loading-screen"
      className="fixed top-0 left-0 w-screen h-screen grid place-content-center z-[9999]"
      style={{
        transition: "opacity 0.5s ease",
      }}
    >
      <Image
        src={"/loader.gif"}
        alt="loader"
        height={100}
        width={100}
        className="scale-150"
        unoptimized
        priority
      />
    </div>
  );
}
