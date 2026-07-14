import type { ReactNode } from "react";
import {
  FaHospital,
  FaGraduationCap,
  FaUtensils,
  FaSpa,
  FaDumbbell,
  FaHouse,
  FaClipboardList,
  FaBrain,
  FaMobileScreenButton,
  FaBolt,
  FaComments,
  FaBullseye,
  FaCalendarCheck,
  FaQrcode,
  FaGlobe,
  FaFileLines,
  FaLanguage,
  FaBell,
  FaChartSimple,
  FaBookOpen,
  FaMoon,
  FaClock,
  FaRotate,
  FaGift,
  FaPhone,
  FaLock,
  FaLightbulb,
} from "react-icons/fa6";

/* ── Chat-demo types (shared by Hero + LiveDemo) ─────────────────────── */

export type ChatStep = {
  from: "user" | "bot";
  text: string;
  typingMs?: number;
  gapMs?: number;
  success?: { title: string; subtitle: string };
};

export type ChatTheme = {
  bgImage: string;
  overlay: string;
  brandName: string;
  agentIcon: ReactNode;
  avatarGrad: string;
  bubbleLabelColor: string;
  userAvatarGrad: string;
  userAvatarText: string;
  userBubbleGrad: string;
  userBubbleText: string;
};

export const clinicTheme: ChatTheme = {
  bgImage: "/clinic.png",
  overlay: "bg-gradient-to-b from-[#061c1e]/65 via-[#061c1e]/45 to-[#061c1e]/70",
  brandName: "CareLife Clinic — AI Agent",
  agentIcon: <FaHospital />,
  avatarGrad: "from-teal-400 to-teal-700",
  bubbleLabelColor: "text-teal-300",
  userAvatarGrad: "from-amber-300 to-amber-600",
  userAvatarText: "text-amber-950",
  userBubbleGrad: "from-amber-300 to-amber-600",
  userBubbleText: "text-amber-950",
};

export const clinicSteps: ChatStep[] = [
  { from: "user", text: "Hi, I need some information" },
  { from: "bot", text: "Hello! 👋 Welcome to CareLife Clinic. How can I help you today?" },
  { from: "user", text: "What are the doctor's timings?" },
  { from: "bot", text: "Dr. Mehta is available Mon–Sat, 10am–1pm and 5pm–8pm. Want to book a slot? 😊" },
  { from: "user", text: "Yes, Saturday at 6pm please" },
  {
    from: "bot",
    text: "✅ Appointment confirmed for Saturday 6pm with Dr. Mehta!",
    success: { title: "Appointment Booked!", subtitle: "Saturday · 6:00 PM · Dr. Mehta" },
  },
  { from: "user", text: "Thank you so much!" },
  { from: "bot", text: "You're most welcome! See you Saturday at 6pm 😊" },
];

export const restaurantTheme: ChatTheme = {
  bgImage: "/restaurant.png",
  overlay: "bg-[#0a0614]/60",
  brandName: "Spice Garden — AI Agent",
  agentIcon: <FaUtensils />,
  avatarGrad: "from-amber-400 to-orange-600",
  bubbleLabelColor: "text-amber-300",
  userAvatarGrad: "from-violet-300 to-violet-600",
  userAvatarText: "text-white",
  userBubbleGrad: "from-amber-400 to-orange-600",
  userBubbleText: "text-white",
};

export const restaurantSteps: ChatStep[] = [
  { from: "bot", text: "Hello! 👋 Welcome to Spice Garden. How can I help you today?" },
  { from: "user", text: "Can I see today's menu?" },
  {
    from: "bot",
    text: "🍛 Today's specials:\n• Veg Thali ₹220\n• Paneer Butter Masala ₹180\n• Biryani ₹250\n\nWant to place an order?",
  },
  { from: "user", text: "Reserve a table for 4 at 8pm" },
  {
    from: "bot",
    text: "🎉 Table for 4 reserved at 8pm tonight! We will see you soon.",
    success: { title: "Table Booked!", subtitle: "4 people · 8:00 PM tonight" },
  },
];

export const schoolTheme: ChatTheme = {
  bgImage: "/school.png",
  overlay: "bg-gradient-to-b from-[#081c26]/65 via-[#081c26]/45 to-[#081c26]/70",
  brandName: "Sunrise Public School — AI Agent",
  agentIcon: <FaGraduationCap />,
  avatarGrad: "from-sky-400 to-sky-800",
  bubbleLabelColor: "text-sky-300",
  userAvatarGrad: "from-orange-300 to-orange-700",
  userAvatarText: "text-orange-950",
  userBubbleGrad: "from-orange-300 to-orange-700",
  userBubbleText: "text-orange-950",
};

export const schoolSteps: ChatStep[] = [
  { from: "user", text: "Hi, I wanted to ask about admissions" },
  { from: "bot", text: "Hello! 👋 Welcome to Sunrise Public School. How can I help you today?" },
  { from: "user", text: "What is the admission process?" },
  {
    from: "bot",
    text: "Admissions for 2025–26 are open! Submit your form online, attach marksheets, and attend counselling. Last date is 30 July.",
  },
  { from: "user", text: "What are the Science stream fees?" },
  { from: "bot", text: "Science stream fees are ₹45,000 per year. Scholarships available for top performers!" },
  { from: "user", text: "That sounds great! Can I schedule a campus visit?" },
  {
    from: "bot",
    text: "🎉 Campus visit scheduled for Monday, 10:00 AM. We look forward to meeting you!",
    success: { title: "Visit Scheduled!", subtitle: "Monday · 10:00 AM" },
  },
  { from: "user", text: "Thank you so much!" },
  { from: "bot", text: "You're most welcome! See you Monday 😊" },
];

/* ── Nav / hero strip ─────────────────────────────────────────────────── */

export const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#demo", label: "Demo" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export const chips = [
  { icon: <FaHospital />, label: "Clinics & Hospitals", cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  { icon: <FaGraduationCap />, label: "Schools & Colleges", cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
  { icon: <FaUtensils />, label: "Restaurants & Cafes", cls: "bg-orange-50 text-orange-700 ring-1 ring-orange-200" },
  { icon: <FaSpa />, label: "Salons & Spas", cls: "bg-pink-50 text-pink-700 ring-1 ring-pink-200" },
  { icon: <FaDumbbell />, label: "Gyms & Fitness", cls: "bg-violet-50 text-violet-700 ring-1 ring-violet-200" },
  { icon: <FaHouse />, label: "Real Estate", cls: "bg-amber-50 text-amber-800 ring-1 ring-amber-200" },
];

/* ── Problem section ──────────────────────────────────────────────────── */

export const problemCards = [
  {
    icon: <FaHospital />,
    biz: "Clinic",
    q: `"What are the doctor's timings?"`,
    desc: "This one question takes 5 minutes per caller, 20 times a day. That is 100 minutes of your staff's time — every single day.",
    ai: "Dr. Mehta is available Mon–Sat, 10am–1pm and 5pm–8pm. Want me to book an appointment?",
  },
  {
    icon: <FaGraduationCap />,
    biz: "School / College",
    q: `"What is the admission process?"`,
    desc: "Parents call all day. Your admissions team cannot focus on real work because every call is the same question.",
    ai: "Admissions are open until 30 July. Fill the form online and attach your marksheets. Want the direct link?",
  },
  {
    icon: <FaUtensils />,
    biz: "Restaurant / Cafe",
    q: `"Can I see the menu?"`,
    desc: "Customers message on WhatsApp, call, and walk in — all asking the same thing. Every time, a staff member stops what they are doing.",
    ai: "Today's Veg Thali is ₹220, Biryani ₹250. Shall I take your order or reserve a table?",
  },
];

/* ── How it works ─────────────────────────────────────────────────────── */

export const steps = [
  { icon: <FaClipboardList />, title: "Share your business info", desc: "Tell us your services, timings, prices, and common questions. You can even send us a WhatsApp message — we will handle the rest." },
  { icon: <FaBrain />, title: "Your Agent learns your business", desc: "We train your AI Agent on your specific business information. It becomes an expert on everything about you." },
  { icon: <FaMobileScreenButton />, title: "Share a link or QR code", desc: "Place the QR code on your reception desk, menu card, or poster. Or share the link on WhatsApp. No website needed." },
  { icon: <FaBolt />, title: "Customers get instant answers", desc: "Your Agent works all day, every day — answering questions, booking appointments, and capturing leads automatically." },
];

/* ── Features ──────────────────────────────────────────────────────────── */

export const features = [
  { icon: <FaComments />, title: "AI Conversations", desc: "Answers customer questions naturally, just like a trained staff member would." },
  { icon: <FaBullseye />, title: "Lead Collection", desc: "Saves every visitor's name, phone, and email so you never lose a potential customer." },
  { icon: <FaCalendarCheck />, title: "Appointment Booking", desc: "Customers book, reschedule, or cancel directly with the Agent — no calls needed." },
  { icon: <FaQrcode />, title: "QR Code", desc: "Print and place anywhere. Customers scan and start chatting immediately." },
  { icon: <FaGlobe />, title: "Website Widget", desc: "One line of code adds a chat button to any website. Works everywhere." },
  { icon: <FaFileLines />, title: "Hosted Business Page", desc: "No website? No problem. We give you a ready page to share with customers." },
  { icon: <FaLanguage />, title: "Hindi & Regional Languages", desc: "Customers can chat in Hindi or their regional language comfortably." },
  { icon: <FaBell />, title: "Instant Notifications", desc: "Get notified by email the moment someone books, enquires, or leaves their details." },
  { icon: <FaChartSimple />, title: "Simple Dashboard", desc: "See how many customers chatted, what they asked, and how many became leads." },
  { icon: <FaBookOpen />, title: "Upload Any Document", desc: "Upload your menu, fee chart, brochure, or price list — Agent reads and learns it." },
];

/* ── Live demo tabs ────────────────────────────────────────────────────── */

export const demoTabs = [
  {
    id: "clinic",
    icon: <FaHospital />,
    name: "Clinic / Doctor",
    sub: "Timings, appointments, services",
    eyebrow: "Healthcare",
    title: "AI Receptionist for Clinics",
    desc: "Handles appointment bookings, shares doctor timings, answers patient questions, and captures contact details — all without a human receptionist.",
    bullets: [
      "Answers timing and availability questions instantly",
      "Books and confirms appointments automatically",
      "Saves patient name and phone for follow-up",
      "Works 24 hours — even on Sunday nights",
    ],
    theme: clinicTheme,
    steps: clinicSteps,
  },
  {
    id: "restaurant",
    icon: <FaUtensils />,
    name: "Restaurant / Cafe",
    sub: "Menu, orders, reservations",
    eyebrow: "Food & Beverage",
    title: "AI Ordering Assistant for Restaurants",
    desc: "Shares today's menu, handles table reservations, takes orders, and tells customers about daily specials — without any staff involvement.",
    bullets: [
      "Shares menu and today's specials on demand",
      "Books tables and confirms reservations",
      "Handles orders and notes dietary preferences",
      "Responds at 2am when your chef is asleep",
    ],
    theme: restaurantTheme,
    steps: restaurantSteps,
  },
  {
    id: "school",
    icon: <FaGraduationCap />,
    name: "School / College",
    sub: "Admissions, fees, courses",
    eyebrow: "Education",
    title: "AI Admission Assistant for Schools",
    desc: "Answers parent and student questions about courses, fees, eligibility, and deadlines. Books counselling sessions automatically and captures every lead.",
    bullets: [
      "Answers admission process questions instantly",
      "Shares fee structure and scholarship details",
      "Books counselling sessions automatically",
      "Captures every parent's contact for follow-up",
    ],
    theme: schoolTheme,
    steps: schoolSteps,
  },
];

/* ── Industries ────────────────────────────────────────────────────────── */

export const industries = [
  { icon: <FaHospital />, accent: "#059669", accentBg: "bg-emerald-50", accentText: "text-emerald-700", cat: "Healthcare", title: "AI Receptionist for Clinics", desc: "Handles appointment bookings, doctor timings, patient queries, and collects contact details — without a human receptionist.", tags: ["Appointments", "Patient Queries", "Lead Capture"] },
  { icon: <FaGraduationCap />, accent: "#2563eb", accentBg: "bg-blue-50", accentText: "text-blue-700", cat: "Education", title: "AI Admission Assistant", desc: "Answers parent and student questions about courses, fees, eligibility, and deadlines. Books counselling sessions automatically.", tags: ["Admission Queries", "Fee Structure", "Lead Capture"] },
  { icon: <FaUtensils />, accent: "#ea580c", accentBg: "bg-orange-50", accentText: "text-orange-700", cat: "Food & Beverage", title: "AI Ordering Assistant", desc: "Shares today's menu, takes orders, handles table reservations, and tells customers about daily specials and offers.", tags: ["Menu & Orders", "Table Booking", "Daily Specials"] },
  { icon: <FaSpa />, accent: "#db2777", accentBg: "bg-pink-50", accentText: "text-pink-700", cat: "Beauty & Wellness", title: "AI Booking Assistant", desc: "Customers browse your services, check availability, and book salon or spa appointments — even at midnight.", tags: ["Bookings", "Price List", "Reminders"] },
  { icon: <FaDumbbell />, accent: "#7c3aed", accentBg: "bg-violet-50", accentText: "text-violet-700", cat: "Fitness", title: "AI Membership Assistant", desc: "Explains your membership plans, shares batch timings, handles trial class bookings, and converts enquiries into members.", tags: ["Membership Info", "Batch Timings", "Trial Booking"] },
  { icon: <FaHouse />, accent: "#92400e", accentBg: "bg-amber-50", accentText: "text-amber-800", cat: "Real Estate", title: "AI Property Assistant", desc: "Shares property details, answers buyer questions, schedules site visits, and saves serious buyer contact details for follow-up.", tags: ["Property Details", "Site Visits", "Buyer Leads"] },
];

/* ── Why us ────────────────────────────────────────────────────────────── */

export const whyProblems = [
  { icon: <FaMoon />, title: "Customers ask after business hours", desc: "Most enquiries come in the evening. Leads go cold by the time your team starts the next morning." },
  { icon: <FaClock />, title: "The first to reply wins the customer", desc: "If you reply in 5 minutes, you are 100× more likely to convert than if you reply in 1 hour." },
  { icon: <FaRotate />, title: "Repetitive questions drain your team", desc: "Your staff answers the same 10 questions all day — time better spent serving customers properly." },
];

export const whySolutions = [
  { title: "Always on — 24 hours, 7 days", desc: "Never misses a customer message, not even at 2am on a Sunday." },
  { title: "Replies in under 3 seconds", desc: "Instant, helpful responses that feel personal — not robotic or generic." },
  { title: "Handles unlimited conversations at once", desc: "100 customers asking at the same time? All get answered instantly." },
  { title: "Captures every lead automatically", desc: "Saves name, phone, and email so you always have someone to follow up with." },
  { title: "Works with or without a website", desc: "Use via QR code, WhatsApp link, or on your website — whatever works for you." },
];

/* ── Pricing ───────────────────────────────────────────────────────────── */

export const plans = [
  {
    name: "Free",
    price: "₹0",
    convos: "~50 conversations / month",
    credits: "1,000,000 AI credits",
    feats: [
      "AI conversations",
      "QR code and hosted business page",
      "Hindi and regional language support",
      "Lead collection",
      "Basic dashboard",
      "1 business profile",
      "200 email notifications / mo",
      "100 MB document storage",
    ],
    cta: "Sign Up Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "₹299",
    convos: "~160 conversations / month",
    credits: "7,500,000 AI credits",
    feats: [
      "Everything in Free",
      "Appointment booking",
      "Website chat widget",
      "1,000 email notifications / mo",
      "Upload menus and brochures",
      "1 GB document storage",
      "Priority support",
    ],
    cta: "Sign Up",
    popular: true,
  },
  {
    name: "Business",
    price: "₹699",
    convos: "~420 conversations / month",
    credits: "20,000,000 AI credits",
    feats: [
      "Everything in Pro",
      "Advanced analytics",
      "Custom Agent name and branding",
      "5,000 email notifications / mo",
      "5 GB document storage",
      "Dedicated onboarding call",
    ],
    cta: "Sign Up",
    popular: false,
  },
];

export const perks = [
  { icon: <FaPhone />, title: "Free Personal Setup Call", desc: "We'll call you, understand your business, and set up your Agent together. Takes about 10 minutes." },
  { icon: <FaGift />, title: "1 Month Free on the Pro Plan", desc: "New sign-ups get their first month on Pro at no extra cost. No credit card needed upfront." },
  { icon: <FaLock />, title: "Priority Support", desc: "Get a fast, direct line to our team whenever you have a question or run into an issue." },
  { icon: <FaLightbulb />, title: "You Help Shape the Product", desc: "Tell us what you need. Customer suggestions get built first." },
];

/* ── FAQ ───────────────────────────────────────────────────────────────── */

export const faqs = [
  { q: "Do I need to have a website?", a: "Not at all. We give you a hosted page and a QR code that works independently. You can share the link on WhatsApp, print the QR code on your visiting card, or paste it anywhere — no website required." },
  { q: "Can I just use the QR code?", a: "Absolutely. Many businesses print the QR code on their reception desk, menu cards, shop window, or visiting cards. Customers scan it and start chatting instantly — no app download needed on their side." },
  { q: "How does the setup work exactly?", a: "Sign up for a plan and we'll schedule a 30-minute call with you. We'll ask about your business — services, timings, prices, and common questions — and set up your AI Agent live on that call. You do not need to do any technical work at all." },
  { q: "Can it really book appointments?", a: "Yes. On Pro and Business plans, customers can request appointments directly through the AI Agent. You get a notification by email or phone. You can confirm manually or set it to auto-confirm." },
  { q: "What if the Agent does not know an answer?", a: "If a customer asks something that is not in your business information, the Agent will politely let them know and offer to connect them with you directly. It never guesses or makes up answers." },
  { q: "How are the conversation limits calculated?", a: "Each plan comes with a fixed pool of AI credits rather than a hard conversation cap. The conversation figures shown are an average estimate based on typical chat length — a plan listed at ~160 conversations may give you fewer if chats run long and detailed, or more if they're short and simple." },
  { q: "Will the pricing stay the same?", a: "We are honest about this — prices may change as we grow. AI infrastructure, new features, and support cost money. Existing customers will always get advance notice before any price change. We are committed to staying affordable for Indian small businesses." },
  { q: "Which types of businesses can use this?", a: "Any business that has customers asking questions can use this — clinics, schools, restaurants, cafes, salons, gyms, real estate agents, coaching institutes, retail shops, and many more. If your customers ask questions, your AI Agent can answer them." },
];