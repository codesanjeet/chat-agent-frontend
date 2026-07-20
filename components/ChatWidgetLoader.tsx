"use client";
import { useEffect } from "react";

export default function ChatWidgetLoader() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://agent.kiteum.com/widget.js";
    script.setAttribute("data-slug", "kiteum");
    script.setAttribute("data-accent-color", "#2B4EFF");
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}