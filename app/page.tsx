"use client";

import { SiteHeader } from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import { ValueProps } from "@/components/home/Valueprops";
import { LiveDemo } from "@/components/home/Livedemo";
import { PricingSection } from "@/components/home/Pricing";
import { ContactFaq } from "@/components/home/Contact";
import { SiteFooter } from "@/components/home/Footer";
// import Script from "next/script";
import ChatWidgetLoader from "@/components/ChatWidgetLoader";

export default function Home() {
  function scrollToContact() {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
   {/* <Script
  src="https://agent.kiteum.com/widget.js"
  data-slug="kiteum"
  data-accent-color="#2B4EFF"
  async
></Script> */}

      <SiteHeader />
      <Hero />
      <ValueProps />
      <LiveDemo />
      <PricingSection onContactClick={scrollToContact} />
      <ContactFaq />
      <SiteFooter />
      <ChatWidgetLoader/>
    </>
  );
}