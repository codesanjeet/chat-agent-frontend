"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  FaCheck,
  FaArrowRight,
  FaPlay,
  FaChevronDown,
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
  FaStar,
} from "react-icons/fa6";
import { HiBars3, HiXMark } from "react-icons/hi2";

/* ────────────────────────────────────────────────────────────────────────
   SHARED HELPERS
   ──────────────────────────────────────────────────────────────────────── */

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   PHONE SHELL — a responsive, auto-scaling device frame.
   Measures its own rendered width and scales a fixed 390×844 "screen"
   to fit, so the exact same chat-demo markup works at any size.
   ──────────────────────────────────────────────────────────────────────── */

function PhoneShell({
  children,
  frameClassName = "",
  radius = 44,
}: {
  children: React.ReactNode;
  frameClassName?: string;
  radius?: number;
}) {
  const screenWrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = screenWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setScale(w / 390);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className={`relative border-[3px] border-black bg-black shadow-[0_2px_2px_rgba(0,0,0,0.15),0_35px_70px_-20px_rgba(0,0,0,0.55)] ${frameClassName}`}
      style={{ borderRadius: radius, padding: 12 }}
    >
      {/* subtle rim light so the black bezel doesn't look flat */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          borderRadius: radius,
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      />
      <div
        className="mx-auto mb-2 bg-black relative z-10"
        style={{ width: "23%", height: 22, borderRadius: "0 0 14px 14px" }}
      />
      <div
        ref={screenWrapRef}
        className="relative overflow-hidden bg-white ring-1 ring-black/20"
        style={{ borderRadius: radius - 12, aspectRatio: "9 / 19.5" }}
      >
        <div
          style={{
            width: 390,
            height: 844,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   CHAT DEMO — a single reusable, looping animated chat conversation.
   Theme + script are supplied per business type (clinic / restaurant /
   school) so the exact same component powers every demo phone.
   ──────────────────────────────────────────────────────────────────────── */

type ChatStep = {
  from: "user" | "bot";
  text: string;
  typingMs?: number;
  gapMs?: number;
  success?: { title: string; subtitle: string };
};

type ChatTheme = {
  bgImage: string;
  overlay: string; // tailwind gradient classes for the color wash over the bg photo
  brandName: string;
  agentIcon: React.ReactNode;
  avatarGrad: string; // tailwind "from-[..] to-[..]"
  bubbleLabelColor: string;
  userAvatarGrad: string;
  userAvatarText: string;
  userBubbleGrad: string;
  userBubbleText: string;
};

function ChatDemo({ theme, steps }: { theme: ChatTheme; steps: ChatStep[] }) {
  const [visible, setVisible] = useState<ChatStep[]>([]);
  const [typing, setTyping] = useState(false);
  const [success, setSuccess] = useState<{ title: string; subtitle: string } | null>(null);

  useEffect(() => {
    let alive = true;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    async function run() {
      while (alive) {
        setVisible([]);
        setSuccess(null);
        setTyping(false);
        for (const step of steps) {
          if (!alive) return;
          if (step.from === "bot") {
            setTyping(true);
            await wait(step.typingMs ?? 900);
            if (!alive) return;
            setTyping(false);
          } else {
            await wait(step.typingMs ?? 700);
          }
          if (!alive) return;
          setVisible((prev) => [...prev, step]);
          if (step.success) {
            await wait(350);
            if (!alive) return;
            setSuccess(step.success);
            hideTimer = setTimeout(() => {
              if (alive) setSuccess(null);
            }, 3000);
          }
          await wait(step.gapMs ?? 1300);
        }
        if (!alive) return;
        await wait(3500);
      }
    }
    run();
    return () => {
      alive = false;
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [steps]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden font-body">
      {/* Background photo + color wash */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${theme.bgImage})` }}
      />
      <div className={`absolute inset-0 ${theme.overlay}`} />

      {/* Top bar */}
      <div className="relative z-10 px-5 pt-[52px]">
        <div className="flex items-center gap-3 rounded-[18px] border border-white/20 bg-white/10 p-3.5 backdrop-blur-2xl">
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.avatarGrad} text-lg text-white shadow-lg`}
          >
            {theme.agentIcon}
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white">{theme.brandName}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[0.68rem] text-white/70">
              <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full bg-green-400" />
              Online · Replies in seconds
            </div>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-[0.68rem] font-semibold text-white/55">
            ← Back
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex flex-1 flex-col justify-end gap-2.5 overflow-hidden px-4 py-5">
        {visible.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`flex items-end gap-2 ${m.from === "user" ? "flex-row-reverse" : ""}`}
          >
            {m.from === "bot" ? (
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${theme.avatarGrad} text-xs text-white shadow`}
              >
                {theme.agentIcon}
              </div>
            ) : (
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${theme.userAvatarGrad} text-[0.7rem] font-bold ${theme.userAvatarText}`}
              >
                RS
              </div>
            )}
            <div
              className={`max-w-[72%] rounded-[18px] px-3.5 py-2.5 text-[0.84rem] leading-relaxed whitespace-pre-line ${
                m.from === "bot"
                  ? "rounded-bl-[5px] border border-white/20 bg-white/15 text-white backdrop-blur-xl"
                  : `rounded-br-[5px] bg-gradient-to-br ${theme.userBubbleGrad} ${theme.userBubbleText} shadow-lg`
              }`}
            >
              {m.from === "bot" && (
                <div
                  className={`mb-1 text-[0.62rem] font-bold uppercase tracking-wide ${theme.bubbleLabelColor}`}
                >
                  {theme.brandName.split(" — ")[0]}
                </div>
              )}
              {m.text}
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-end gap-2"
            >
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${theme.avatarGrad} text-xs text-white shadow`}
              >
                {theme.agentIcon}
              </div>
              <div className="flex items-center gap-1.5 rounded-[18px] rounded-bl-[5px] border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-xl">
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    className="h-[7px] w-[7px] rounded-full bg-white/65"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: d * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success modal */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.94, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 16, scale: 0.94, x: "-50%" }}
            className="absolute bottom-[118px] left-1/2 z-30 flex max-w-[300px] items-center gap-3 rounded-2xl border border-white/15 bg-[#081a22]/90 p-3.5 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-green-500 shadow-lg">
              <FaCheck className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="text-sm font-bold text-white">{success.title}</div>
              <div className="text-[0.74rem] text-white/65">{success.subtitle}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="relative z-10 px-4 pb-9 pt-3">
        <div className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-3.5 py-3 backdrop-blur-2xl">
          <span className="flex-1 text-[0.84rem] text-white/50">Type your message…</span>
          <div
            className={`flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br ${theme.avatarGrad} text-white shadow-lg`}
          >
            <FaArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 right-4 z-10 text-[0.65rem] font-semibold text-white/30">
        Agent.Kiteum
      </div>
    </div>
  );
}

/* ── Demo themes + scripts ───────────────────────────────────────────── */

const clinicTheme: ChatTheme = {
  bgImage: "/clinic.png",
  overlay: "bg-gradient-to-b from-[#061c1e]/60 via-[#061c1e]/40 to-[#061c1e]/65",
  brandName: "CareLife Clinic — AI Agent",
  agentIcon: <FaHospital />,
  avatarGrad: "from-[#45c2bd] to-[#0e7c78]",
  bubbleLabelColor: "text-[#7fe3dd]",
  userAvatarGrad: "from-[#f3c969] to-[#c8901f]",
  userAvatarText: "text-[#2b1c02]",
  userBubbleGrad: "from-[#f3c969] to-[#c8901f]",
  userBubbleText: "text-[#2b1c02]",
};

const clinicSteps: ChatStep[] = [
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

const restaurantTheme: ChatTheme = {
  bgImage: "/restaurant.png",
  overlay: "bg-[#0a0614]/55",
  brandName: "Spice Garden — AI Agent",
  agentIcon: <FaUtensils />,
  avatarGrad: "from-[#f59e0b] to-[#d97706]",
  bubbleLabelColor: "text-[#fcd34d]",
  userAvatarGrad: "from-[#a78bfa] to-[#7c3aed]",
  userAvatarText: "text-white",
  userBubbleGrad: "from-[#f59e0b] to-[#d97706]",
  userBubbleText: "text-white",
};

const restaurantSteps: ChatStep[] = [
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

const schoolTheme: ChatTheme = {
  bgImage: "/school.png",
  overlay: "bg-gradient-to-b from-[#081c26]/60 via-[#081c26]/40 to-[#081c26]/65",
  brandName: "Sunrise Public School — AI Agent",
  agentIcon: <FaGraduationCap />,
  avatarGrad: "from-[#2f8fb3] to-[#145973]",
  bubbleLabelColor: "text-[#8fd6ef]",
  userAvatarGrad: "from-[#e0976a] to-[#a85a36]",
  userAvatarText: "text-[#2b1505]",
  userBubbleGrad: "from-[#e0976a] to-[#a85a36]",
  userBubbleText: "text-[#2b1505]",
};

const schoolSteps: ChatStep[] = [
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

/* ────────────────────────────────────────────────────────────────────────
   STATIC DATA — mirrors the original page's content
   ──────────────────────────────────────────────────────────────────────── */

const chips = [
  { icon: <FaHospital />, label: "Clinics & Hospitals", cls: "bg-green-light text-green border-[#A7F3D0]" },
  { icon: <FaGraduationCap />, label: "Schools & Colleges", cls: "bg-blue-light text-blue border-blue-mid" },
  { icon: <FaUtensils />, label: "Restaurants & Cafes", cls: "bg-orange-light text-orange border-[#FED7AA]" },
  { icon: <FaSpa />, label: "Salons & Spas", cls: "bg-pink-light text-pink border-[#FBCFE8]" },
  { icon: <FaDumbbell />, label: "Gyms & Fitness", cls: "bg-purple-light text-purple border-[#DDD6FE]" },
  { icon: <FaHouse />, label: "Real Estate", cls: "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]" },
];

const problemCards = [
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

const steps = [
  { icon: <FaClipboardList />, title: "Share your business info", desc: "Tell us your services, timings, prices, and common questions. You can even send us a WhatsApp message — we will handle the rest." },
  { icon: <FaBrain />, title: "Your Agent learns your business", desc: "We train your AI Agent on your specific business information. It becomes an expert on everything about you." },
  { icon: <FaMobileScreenButton />, title: "Share a link or QR code", desc: "Place the QR code on your reception desk, menu card, or poster. Or share the link on WhatsApp. No website needed." },
  { icon: <FaBolt />, title: "Customers get instant answers", desc: "Your Agent works all day, every day — answering questions, booking appointments, and capturing leads automatically." },
];

const features = [
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

const demoTabs = [
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

const industries = [
  { icon: <FaHospital />, border: "#059669", cat: "Healthcare", title: "AI Receptionist for Clinics", desc: "Handles appointment bookings, doctor timings, patient queries, and collects contact details — without a human receptionist.", tags: ["Appointments", "Patient Queries", "Lead Capture"], tagCls: "bg-green-light text-green" },
  { icon: <FaGraduationCap />, border: "#2563EB", cat: "Education", title: "AI Admission Assistant", desc: "Answers parent and student questions about courses, fees, eligibility, and deadlines. Books counselling sessions automatically.", tags: ["Admission Queries", "Fee Structure", "Lead Capture"], tagCls: "bg-blue-light text-blue" },
  { icon: <FaUtensils />, border: "#EA580C", cat: "Food & Beverage", title: "AI Ordering Assistant", desc: "Shares today's menu, takes orders, handles table reservations, and tells customers about daily specials and offers.", tags: ["Menu & Orders", "Table Booking", "Daily Specials"], tagCls: "bg-orange-light text-orange" },
  { icon: <FaSpa />, border: "#DB2777", cat: "Beauty & Wellness", title: "AI Booking Assistant", desc: "Customers browse your services, check availability, and book salon or spa appointments — even at midnight.", tags: ["Bookings", "Price List", "Reminders"], tagCls: "bg-pink-light text-pink" },
  { icon: <FaDumbbell />, border: "#7C3AED", cat: "Fitness", title: "AI Membership Assistant", desc: "Explains your membership plans, shares batch timings, handles trial class bookings, and converts enquiries into members.", tags: ["Membership Info", "Batch Timings", "Trial Booking"], tagCls: "bg-purple-light text-purple" },
  { icon: <FaHouse />, border: "#92400E", cat: "Real Estate", title: "AI Property Assistant", desc: "Shares property details, answers buyer questions, schedules site visits, and saves serious buyer contact details for follow-up.", tags: ["Property Details", "Site Visits", "Buyer Leads"], tagCls: "bg-[#FEF3C7] text-[#92400E]" },
];

const whyProblems = [
  { icon: <FaMoon />, title: "Customers ask after business hours", desc: "Most enquiries come in the evening. Leads go cold by the time your team starts the next morning." },
  { icon: <FaClock />, title: "The first to reply wins the customer", desc: "If you reply in 5 minutes, you are 100× more likely to convert than if you reply in 1 hour." },
  { icon: <FaRotate />, title: "Repetitive questions drain your team", desc: "Your staff answers the same 10 questions all day — time better spent serving customers properly." },
];

const whySolutions = [
  { title: "Always on — 24 hours, 7 days", desc: "Never misses a customer message, not even at 2am on a Sunday." },
  { title: "Replies in under 3 seconds", desc: "Instant, helpful responses that feel personal — not robotic or generic." },
  { title: "Handles unlimited conversations at once", desc: "100 customers asking at the same time? All get answered instantly." },
  { title: "Captures every lead automatically", desc: "Saves name, phone, and email so you always have someone to follow up with." },
  { title: "Works with or without a website", desc: "Use via QR code, WhatsApp link, or on your website — whatever works for you." },
];

const plans = [
  {
    name: "Free",
    price: "₹0",
    convos: "80 customer conversations per month",
    feats: ["AI conversations", "QR code and hosted business page", "Hindi and regional language support", "Lead collection", "Basic dashboard", "1 business profile"],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Starter",
    price: "₹249",
    convos: "600 customer conversations per month",
    feats: ["Everything in Free", "Appointment booking", "Website chat widget", "Email notifications", "Upload menus and brochures", "Priority support"],
    cta: "Get Early Access",
    popular: true,
  },
  {
    name: "Growth",
    price: "₹399",
    convos: "1,000 customer conversations per month",
    feats: ["Everything in Starter", "Advanced analytics", "Custom Agent name and branding", "More Conversation", "Dedicated onboarding call"],
    cta: "Get Started",
    popular: false,
  },
];

const perks = [
  { icon: <FaGift />, title: "1 Months Free on the Starter Plan", desc: "Early access members get 1 months on the Starter plan at no cost. No credit card needed upfront." },
  { icon: <FaPhone />, title: "Free Personal Setup Call", desc: "Once we launch, we'll call you, understand your business, and set everything up together. Takes 10 minutes." },
  { icon: <FaLock />, title: "Priority Access", desc: "Be first in line as we onboard new businesses. Early members get their Agent set up before the public launch." },
  { icon: <FaLightbulb />, title: "You Help Shape the Product", desc: "Tell us what you need. Early members get a direct line to our team and their suggestions get built first." },
];

const faqs = [
  { q: "Do I need to have a website?", a: "Not at all. We give you a hosted page and a QR code that works independently. You can share the link on WhatsApp, print the QR code on your visiting card, or paste it anywhere — no website required." },
  { q: "Can I just use the QR code?", a: "Absolutely. Many businesses print the QR code on their reception desk, menu cards, shop window, or visiting cards. Customers scan it and start chatting instantly — no app download needed on their side." },
  { q: "How does the setup work exactly?", a: "We're currently in pre-launch, so the product isn't live yet. Join the waitlist now and once we launch, we'll schedule a 30-minute call with you. We'll ask about your business — services, timings, prices, and common questions — and set up your AI Agent during that call. You do not need to do any technical work at all." },
  { q: "Can it really book appointments?", a: "Yes. On Starter and Growth plans, customers can request appointments directly through the AI Agent. You get a notification by email or phone. You can confirm manually or set it to auto-confirm." },
  { q: "What if the Agent does not know an answer?", a: "If a customer asks something that is not in your business information, the Agent will politely let them know and offer to connect them with you directly. It never guesses or makes up answers." },
  { q: "Will the pricing stay the same?", a: "We are honest about this — current prices are early access rates and may change as we grow. AI infrastructure, new features, and support cost money. Early access members will always get advance notice before any price change and will be the last to be affected. We are committed to staying affordable for Indian small businesses." },
  { q: "Which types of businesses can use this?", a: "Any business that has customers asking questions can use this — clinics, schools, restaurants, cafes, salons, gyms, real estate agents, coaching institutes, retail shops, and many more. If your customers ask questions, your AI Agent can answer them." },
];

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#demo", label: "Demo" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

/* ────────────────────────────────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────────────────────────────────── */

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDemo, setActiveDemo] = useState(demoTabs[0].id);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [form, setForm] = useState({ name: "", biz: "", email: "", phone: "", type: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const activeTab = demoTabs.find((t) => t.id === activeDemo)!;

  function scrollToWaitlist() {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleSubmit() {
    setError("");
    if (!form.name || !form.biz || !form.email || !form.phone || !form.type) {
      setError("Please fill in all fields to join the waitlist.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("https://api.edu.kiteum.com/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          institute: form.biz,
          email: form.email,
          phone: form.phone,
          message: form.type,
        }),
      });
      if (res.ok || res.status === 201) {
        setSubmitted(true);
      } else {
        let msg = "Something went wrong. Please try again.";
        try {
          const data = await res.json();
          if (data?.detail) msg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
        } catch {
          /* ignore parse errors */
        }
        setError(msg);
        setSubmitting(false);
      }
    } catch {
      setError("Could not connect. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-[100] border-b border-line bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-5 sm:px-8">
          <a href="#" className="font-display text-[1.05rem] font-extrabold tracking-tight text-ink">
            Agent<span className="text-blue">.</span>Kiteum
          </a>
          <ul className="hidden gap-8 md:flex">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-sm font-medium text-ink-3 transition-colors hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="hidden items-center gap-3 md:flex">
            <a href="#waitlist" className="rounded-lg px-4 py-2 text-sm font-semibold text-ink-2 transition-colors hover:bg-surface hover:text-ink">
              Sign in
            </a>
            <a href="#waitlist" className="rounded-[9px] bg-ink px-[22px] py-2.5 text-sm font-bold tracking-tight text-white transition-all hover:bg-[#1E293B]">
              Get Early Access
            </a>
          </div>
          <button
            aria-label="Toggle menu"
            className="p-1.5 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <HiXMark className="h-6 w-6 text-ink" /> : <HiBars3 className="h-6 w-6 text-ink" />}
          </button>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-line bg-white md:hidden"
            >
              <div className="flex flex-col px-6 pb-6 pt-2">
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="border-b border-line py-3.5 text-[0.95rem] font-medium text-ink-2"
                  >
                    {l.label}
                  </a>
                ))}
                <a
                  href="#waitlist"
                  onClick={() => setMobileOpen(false)}
                  className="mt-3.5 block rounded-[9px] bg-ink px-[22px] py-2.5 text-center text-sm font-bold text-white"
                >
                  Get Early Access — Free
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white px-5 py-16 sm:px-8 sm:py-24">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.06)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(5,150,105,0.05)_0%,transparent_70%)]" />
        <div className="relative z-[1] mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-mid bg-blue-light px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-blue">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22C55E]" /> Coming Soon — Join the Waitlist
              </div>
              <h1 className="font-display text-[2.1rem] font-black leading-[1.12] tracking-tight text-ink sm:text-[3.4rem]">
                Your business needs a{" "}
                <span className="bg-gradient-to-br from-blue to-purple bg-clip-text text-transparent">
                  24/7 AI Assistant
                </span>
              </h1>
              <p className="mt-5 max-w-[460px] text-[1.05rem] leading-relaxed text-ink-3">
                Customers ask questions at all hours. Your AI Agent answers instantly — books appointments, shares your menu, captures leads — while you focus on running your business.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#waitlist"
                  className="inline-flex items-center gap-2 rounded-[10px] bg-blue px-7 py-3.5 text-sm font-bold tracking-tight text-white shadow-[0_4px_16px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-0.5 hover:bg-blue-dark hover:shadow-[0_8px_24px_rgba(37,99,235,0.35)]"
                >
                  Get Early Access — It&apos;s Free <FaArrowRight className="h-3.5 w-3.5" />
                </a>
                <a
                  href="#demo"
                  className="inline-flex items-center gap-2 rounded-[10px] border-[1.5px] border-line px-6 py-3.5 text-sm font-semibold text-ink-2 transition-all hover:border-blue hover:bg-blue-light hover:text-blue"
                >
                  <FaPlay className="h-3 w-3" /> See It in Action
                </a>
              </div>
              <div className="mt-11 flex gap-8">
                {[
                  ["24/7", "Always available"],
                  ["<3s", "Reply time"],
                  ["30m", "Setup time"],
                ].map(([num, label], i) => (
                  <div key={num} className={`flex items-center gap-8 ${i > 0 ? "border-l border-line pl-8" : ""}`}>
                    <div>
                      <div className="font-display text-[1.6rem] font-extrabold tracking-tight text-ink">{num}</div>
                      <div className="text-[0.78rem] font-medium text-ink-3">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="relative mx-auto max-w-[300px]">
            <motion.div
              className="absolute -right-6 top-12 z-20 hidden items-center gap-1.5 whitespace-nowrap rounded-xl border border-[#D1FAE5] bg-white px-3.5 py-2.5 text-[0.73rem] font-bold text-green shadow-lg sm:flex"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <FaCheck className="h-3 w-3" /> Appointment Booked
            </motion.div>
            <motion.div
              className="absolute -left-6 bottom-16 z-20 hidden items-center gap-1.5 whitespace-nowrap rounded-xl border border-[#FED7AA] bg-white px-3.5 py-2.5 text-[0.73rem] font-bold text-orange shadow-lg sm:flex"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            >
              <FaFileLines className="h-3 w-3" /> New Lead Captured
            </motion.div>
            <PhoneShell radius={44}>
              <ChatDemo theme={clinicTheme} steps={clinicSteps} />
            </PhoneShell>
          </div>
        </div>
      </section>

      {/* ── STRIP ───────────────────────────────────────────────────── */}
      <div className="border-y border-line bg-surface px-5 py-7 sm:px-8">
        <div className="mx-auto max-w-[1180px]">
          <p className="mb-5 text-center text-[0.73rem] font-bold uppercase tracking-[1.5px] text-ink-3">
            Works for any type of business
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {chips.map((c) => (
              <div
                key={c.label}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-[0.82rem] font-semibold transition-transform hover:-translate-y-0.5 hover:shadow-sm2 ${c.cls}`}
              >
                {c.icon} {c.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROBLEM ─────────────────────────────────────────────────── */}
      <section className="bg-surface px-5 py-16 sm:px-8 sm:py-24" id="problem">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="text-center">
            <div className="mb-3.5 text-xs font-bold uppercase tracking-[1.5px] text-blue">The Problem</div>
            <h2 className="font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-ink sm:text-[2.5rem]">
              Your customers ask the same questions every day
            </h2>
            <p className="mx-auto mt-3.5 max-w-[540px] text-base leading-loose text-ink-3">
              Your staff repeats the same answers 20 times a day. And when they are busy or off-hours, customers go unanswered — and choose someone else.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {problemCards.map((p, i) => (
              <Reveal key={p.biz} delay={i * 0.08}>
                <div className="h-full rounded-rlg border border-line bg-white p-7 shadow-sm2 transition-all hover:-translate-y-1 hover:shadow-lg2">
                  <div className="mb-3.5 text-2xl text-ink-2">{p.icon}</div>
                  <div className="mb-2.5 text-[0.7rem] font-bold uppercase tracking-[1.2px] text-ink-3">{p.biz}</div>
                  <div className="mb-3 rounded-lg border-l-[3px] border-[#EAB308] bg-[#FEFCE8] px-3.5 py-2.5 text-[0.93rem] font-bold leading-relaxed text-ink">
                    {p.q}
                  </div>
                  <p className="mb-4 text-[0.8rem] leading-relaxed text-ink-3">{p.desc}</p>
                  <div className="rounded-[10px] border border-[#A7F3D0] bg-green-light p-3.5">
                    <div className="mb-1.5 text-[0.68rem] font-bold uppercase tracking-wide text-green">
                      ✦ Kiteum Agent answers instantly
                    </div>
                    <p className="text-[0.82rem] leading-relaxed text-[#065F46]">{p.ai}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
      <section className="px-5 py-16 sm:px-8 sm:py-24" id="how">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="text-center">
            <div className="mb-3.5 text-xs font-bold uppercase tracking-[1.5px] text-blue">How It Works</div>
            <h2 className="font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-ink sm:text-[2.5rem]">
              Set up in under 10 minutes
            </h2>
            <p className="mx-auto mt-3.5 max-w-[540px] text-base leading-loose text-ink-3">
              No coding. No technical skills required. If you can fill a form and share a link, you can set this up today.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08} className="relative">
                <div className="relative h-full rounded-rlg border border-line bg-white p-7 px-5 text-center transition-all hover:-translate-y-1 hover:shadow-lg2">
                  {i < steps.length - 1 && (
                    <div className="absolute right-[-12px] top-[38px] hidden h-0.5 w-6 bg-blue-mid lg:block" />
                  )}
                  <div className="mx-auto mb-4 flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-blue-mid bg-blue-light font-display text-sm font-extrabold text-blue">
                    {i + 1}
                  </div>
                  <div className="mb-3 flex justify-center text-xl text-blue">{s.icon}</div>
                  <div className="mb-2 text-sm font-bold text-ink">{s.title}</div>
                  <div className="text-[0.8rem] leading-relaxed text-ink-3">{s.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────── */}
      <section className="bg-surface px-5 py-16 sm:px-8 sm:py-24" id="features">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="text-center">
            <div className="mb-3.5 text-xs font-bold uppercase tracking-[1.5px] text-blue">Features</div>
            <h2 className="font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-ink sm:text-[2.5rem]">
              Everything your business needs
            </h2>
            <p className="mx-auto mt-3.5 max-w-[540px] text-base leading-loose text-ink-3">
              One AI Agent that handles customer conversations end to end — so your team can focus on the work that really matters.
            </p>
          </Reveal>
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 5) * 0.06}>
                <div className="h-full rounded-rlg border border-line bg-white p-6 px-4 text-center transition-all hover:-translate-y-1 hover:border-blue-mid hover:bg-blue-light hover:shadow-md2">
                  <div className="mb-3 flex justify-center text-xl text-blue">{f.icon}</div>
                  <div className="mb-1.5 text-[0.85rem] font-bold text-ink">{f.title}</div>
                  <div className="text-[0.76rem] leading-relaxed text-ink-3">{f.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO ───────────────────────────────────────────────── */}
      <section className="px-5 py-16 sm:px-8 sm:py-24" id="demo">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="text-center">
            <div className="mb-3.5 text-xs font-bold uppercase tracking-[1.5px] text-blue">Live Demo</div>
            <h2 className="font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-ink sm:text-[2.5rem]">
              See it in action — for your business type
            </h2>
            <p className="mx-auto mt-3.5 max-w-[540px] text-base leading-loose text-ink-3">
              Watch exactly what your customers will experience. Choose your industry below.
            </p>
          </Reveal>

          <Reveal className="mt-14">
            <div className="flex flex-col rounded-t-rlg border border-line bg-surface sm:flex-row">
              {demoTabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveDemo(t.id)}
                  className={`flex flex-1 items-center justify-center gap-2.5 border-b border-line px-5 py-4 text-sm font-semibold transition-colors last:border-r-0 sm:border-b-0 sm:border-r ${
                    activeDemo === t.id ? "border-b-2 border-b-blue bg-white text-blue" : "text-ink-3 hover:bg-white/60 hover:text-ink"
                  }`}
                >
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-left">
                    <div className="font-bold">{t.name}</div>
                    <div className="text-[0.72rem] font-medium text-ink-3">{t.sub}</div>
                  </span>
                </button>
              ))}
            </div>
            <div className="overflow-hidden rounded-b-rlg border border-t-0 border-line bg-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid items-center lg:grid-cols-[1fr_1.4fr]"
                >
                  <div className="p-6 sm:p-10">
                    <div className="mb-2.5 text-xs font-bold uppercase tracking-[1.5px] text-blue">{activeTab.eyebrow}</div>
                    <h3 className="mb-3.5 font-display text-xl font-extrabold tracking-tight text-ink">{activeTab.title}</h3>
                    <p className="mb-6 text-sm leading-relaxed text-ink-3">{activeTab.desc}</p>
                    <div className="flex flex-col gap-2.5">
                      {activeTab.bullets.map((b) => (
                        <div key={b} className="flex items-center gap-2.5 text-sm font-medium text-ink-2">
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border border-[#A7F3D0] bg-green-light text-[0.62rem] font-extrabold text-green">
                            <FaCheck className="h-2.5 w-2.5" />
                          </span>
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex min-h-[420px] items-center justify-center border-t border-line bg-surface p-8 sm:min-h-[560px] lg:border-l lg:border-t-0">
                    <div className="w-[260px] sm:w-[300px]">
                      <PhoneShell radius={50}>
                        <ChatDemo theme={activeTab.theme} steps={activeTab.steps} />
                      </PhoneShell>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
          <p className="mt-4 text-center text-[0.78rem] text-ink-3">
            Your Agent will be trained specifically on your business information — not a generic demo.
          </p>
        </div>
      </section>

      {/* ── INDUSTRIES ──────────────────────────────────────────────── */}
      <section className="bg-surface px-5 py-16 sm:px-8 sm:py-24" id="industries">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="text-center">
            <div className="mb-3.5 text-xs font-bold uppercase tracking-[1.5px] text-blue">Who It&apos;s For</div>
            <h2 className="font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-ink sm:text-[2.5rem]">
              Built for businesses like yours
            </h2>
            <p className="mx-auto mt-3.5 max-w-[540px] text-base leading-loose text-ink-3">
              No matter what type of business you run, Kiteum Agent adapts to your needs and speaks your customers&apos; language.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((ind, i) => (
              <Reveal key={ind.title} delay={(i % 3) * 0.08}>
                <div
                  className="h-full rounded-rlg border border-line bg-white p-7 transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-lg2"
                  style={{ borderTopWidth: 3, borderTopColor: ind.border }}
                >
                  <div className="mb-3.5 text-3xl" style={{ color: ind.border }}>{ind.icon}</div>
                  <div className="mb-1.5 text-[0.68rem] font-bold uppercase tracking-[1.2px] text-ink-3">{ind.cat}</div>
                  <div className="mb-2 font-display text-base font-extrabold text-ink">{ind.title}</div>
                  <div className="mb-4 text-[0.82rem] leading-relaxed text-ink-3">{ind.desc}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {ind.tags.map((tag) => (
                      <span key={tag} className={`rounded-full px-2.5 py-1 text-[0.71rem] font-semibold ${ind.tagCls}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY AGENT.KITEUM ────────────────────────────────────────── */}
      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <div className="mb-3.5 text-xs font-bold uppercase tracking-[1.5px] text-blue">Why Agent.Kiteum</div>
              <h2 className="mb-3.5 font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-ink sm:text-[2.5rem]">
                Most businesses lose customers before saying hello
              </h2>
              <p className="mb-8 max-w-[540px] text-base leading-loose text-ink-3">
                Every missed call, every unanswered message, every slow reply — that&apos;s a customer who chose your competitor. Here&apos;s what&apos;s really happening:
              </p>
            </Reveal>
            <Reveal className="flex flex-col gap-3">
              {whyProblems.map((p) => (
                <div key={p.title} className="flex items-start gap-3.5 rounded-r border border-[#FEE2E2] bg-white p-4.5 px-5">
                  <div className="mt-0.5 flex-shrink-0 text-lg text-[#DC2626]">{p.icon}</div>
                  <div>
                    <div className="mb-1 text-[0.88rem] font-bold text-ink">{p.title}</div>
                    <div className="text-[0.79rem] leading-relaxed text-ink-3">{p.desc}</div>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
          <div>
            <Reveal className="mb-4 text-xs font-bold uppercase tracking-[1.2px] text-green">
              Kiteum Agent solves all of this
            </Reveal>
            <Reveal className="flex flex-col gap-3">
              {whySolutions.map((s) => (
                <div key={s.title} className="flex items-start gap-3.5 rounded-r border border-[#A7F3D0] bg-green-light p-4.5 px-5">
                  <div className="mt-0.5 flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-green text-[0.65rem] font-extrabold text-white">
                    <FaCheck className="h-2.5 w-2.5" />
                  </div>
                  <div>
                    <div className="mb-1 text-[0.88rem] font-bold text-[#065F46]">{s.title}</div>
                    <div className="text-[0.79rem] leading-relaxed text-[#047857]">{s.desc}</div>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────── */}
      <section className="bg-surface px-5 py-16 sm:px-8 sm:py-24" id="pricing">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="text-center">
            <div className="mb-3.5 text-xs font-bold uppercase tracking-[1.5px] text-blue">Pricing</div>
            <h2 className="font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-ink sm:text-[2.5rem]">
              Start free. Upgrade when you&apos;re ready.
            </h2>
            <p className="mx-auto mt-3.5 max-w-[540px] text-base leading-loose text-ink-3">
              No hidden charges. No setup fees. No long contracts. Cancel anytime.
            </p>
          </Reveal>
          <div className="mx-auto mt-14 grid max-w-[420px] gap-5 lg:max-w-none lg:grid-cols-3">
            {plans.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.1}>
                <div
                  className={`relative h-full rounded-rlg border-[1.5px] bg-white p-8 px-7 transition-all hover:-translate-y-1 hover:shadow-lg2 ${
                    p.popular ? "border-blue" : "border-line"
                  }`}
                >
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-blue px-4 py-1 text-[0.7rem] font-bold text-white">
                      <FaStar className="mr-1 inline h-2.5 w-2.5 -translate-y-px" /> Most Popular
                    </div>
                  )}
                  <div className="mb-3 text-[0.72rem] font-bold uppercase tracking-[1.5px] text-ink-3">{p.name}</div>
                  <div className="font-display text-[2.6rem] font-black leading-none tracking-tight text-ink">
                    {p.price} <span className="text-base font-medium tracking-normal text-ink-3">/ month</span>
                  </div>
                  <div className="mb-5 mt-1.5 border-b border-line pb-5 text-sm text-ink-3">{p.convos}</div>
                  <div className="mb-6 flex flex-col gap-2.5">
                    {p.feats.map((f) => (
                      <div key={f} className="flex items-start gap-2.5 text-sm text-ink-2">
                        <FaCheck className="mt-1 h-3 w-3 flex-shrink-0 text-green" /> {f}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={scrollToWaitlist}
                    className={
                      p.popular
                        ? "w-full rounded-[10px] bg-blue py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(37,99,235,0.28)] transition-all hover:-translate-y-0.5 hover:bg-blue-dark"
                        : "w-full rounded-[10px] border-[1.5px] border-line bg-white py-3.5 text-sm font-bold text-ink-2 transition-all hover:border-blue hover:bg-blue-light hover:text-blue"
                    }
                  >
                    {p.cta}
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-center text-[0.83rem] text-ink-3">
            🎁 Early access members get <strong className="font-semibold text-ink">1 months free</strong> on the Starter plan.{" "}
            <a href="#waitlist" className="font-semibold text-blue">Join the waitlist →</a>
          </p>
        </div>
      </section>

      {/* ── WAITLIST ────────────────────────────────────────────────── */}
      <section className="px-5 py-16 sm:px-8 sm:py-24" id="waitlist">
        <div className="mx-auto grid max-w-[1180px] items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="mb-3.5 text-xs font-bold uppercase tracking-[1.5px] text-blue">Early Access</div>
            <h3 className="mb-2 font-display text-2xl font-extrabold tracking-tight text-ink">
              Be one of the first businesses to use it
            </h3>
            <p className="mb-8 text-[0.92rem] leading-loose text-ink-3">
              We&apos;re putting the finishing touches on the product. Join the waitlist now and once we launch, you&apos;ll get free setup help, priority access, and 2 months free on the Starter plan.
            </p>
            <div className="flex flex-col gap-6">
              {perks.map((p) => (
                <div key={p.title} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-blue-mid bg-blue-light text-lg text-blue">
                    {p.icon}
                  </div>
                  <div>
                    <div className="mb-1 text-[0.88rem] font-bold text-ink">{p.title}</div>
                    <div className="text-[0.8rem] leading-relaxed text-ink-3">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <div className="rounded-rlg border border-line bg-white p-9 shadow-md2">
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h3 className="mb-1.5 font-display text-xl font-extrabold tracking-tight text-ink">
                      Request Early Access
                    </h3>
                    <p className="mb-6 text-[0.85rem] text-ink-3">
                      We&apos;re still building this. Join now and you&apos;ll be among the very first to get access — and try it for free — the moment it&apos;s ready.
                    </p>
                    <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-ink-2">Your Name *</label>
                        <input
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Rahul Sharma"
                          className="w-full rounded-[10px] border-[1.5px] border-line px-3.5 py-3 text-sm outline-none transition-all focus:border-blue focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-ink-2">Business Name *</label>
                        <input
                          value={form.biz}
                          onChange={(e) => setForm({ ...form, biz: e.target.value })}
                          placeholder="Sharma Clinic"
                          className="w-full rounded-[10px] border-[1.5px] border-line px-3.5 py-3 text-sm outline-none transition-all focus:border-blue focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="mb-1.5 block text-sm font-semibold text-ink-2">Email Address *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="rahul@email.com"
                        className="w-full rounded-[10px] border-[1.5px] border-line px-3.5 py-3 text-sm outline-none transition-all focus:border-blue focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="mb-1.5 block text-sm font-semibold text-ink-2">Phone Number *</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-[10px] border-[1.5px] border-line px-3.5 py-3 text-sm outline-none transition-all focus:border-blue focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="mb-1.5 block text-sm font-semibold text-ink-2">Business Type *</label>
                      <select
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className="w-full appearance-none rounded-[10px] border-[1.5px] border-line px-3.5 py-3 text-sm outline-none transition-all focus:border-blue focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
                      >
                        <option value="" disabled>Select your business type</option>
                        <option>Clinic / Hospital</option>
                        <option>School / College</option>
                        <option>Restaurant / Cafe</option>
                        <option>Salon / Spa</option>
                        <option>Gym / Fitness</option>
                        <option>Real Estate</option>
                        <option>Retail Shop</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full rounded-[10px] bg-blue py-4 text-[0.92rem] font-bold tracking-tight text-white shadow-[0_4px_16px_rgba(37,99,235,0.28)] transition-all hover:-translate-y-0.5 hover:bg-blue-dark disabled:translate-y-0 disabled:opacity-70"
                    >
                      {submitting ? "Submitting…" : "Join the Waitlist — It's Free →"}
                    </button>
                    {error && <p className="mt-2.5 text-center text-sm text-[#DC2626]">{error}</p>}
                    <p className="mt-3 text-center text-[0.74rem] text-ink-3">
                      🔒 Your details are safe. We will never spam you.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-8 text-center"
                  >
                    <div className="mb-3.5 text-5xl">🎉</div>
                    <h3 className="mb-2 text-lg font-extrabold text-ink">You&apos;re on the list!</h3>
                    <p className="text-[0.85rem] leading-loose text-ink-3">
                      You&apos;re on the list. We&apos;ll reach out as soon as we launch, and you&apos;ll be one of the first businesses to get your AI Agent set up. Keep an eye on your inbox.
                    </p>
                    <p className="mt-3 text-[0.78rem] font-semibold text-blue">
                      Know a business owner who&apos;d benefit from this? Share this with them!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section className="bg-surface px-5 py-16 sm:px-8 sm:py-24" id="faq">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="text-center">
            <div className="mb-3.5 text-xs font-bold uppercase tracking-[1.5px] text-blue">FAQ</div>
            <h2 className="font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-ink sm:text-[2.5rem]">
              Questions we get asked a lot
            </h2>
          </Reveal>
          <div className="mx-auto mt-12 flex max-w-[720px] flex-col gap-2">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.03}>
                <div className="overflow-hidden rounded-r border border-line bg-white">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4.5 text-left text-sm font-bold text-ink transition-colors hover:text-blue"
                  >
                    {f.q}
                    <motion.span
                      animate={{ rotate: openFaq === i ? 180 : 0, color: openFaq === i ? "#2563EB" : "#64748B" }}
                      className="flex-shrink-0 text-sm"
                    >
                      <FaChevronDown />
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-4.5 text-[0.85rem] leading-loose text-ink-3">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="bg-ink px-5 py-16 pb-8 sm:px-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-[2.2fr_1fr_1fr_1fr]">
            <div>
              <div className="mb-3 font-display text-[1.05rem] font-extrabold tracking-tight text-white">
                Agent.<em className="not-italic text-[#60A5FA]">Kiteum</em>
              </div>
              <p className="max-w-[260px] text-[0.82rem] leading-loose text-[#94A3B8]">
                An AI Agent that works like a digital employee for your business — available 24/7, no website needed, set up in 30 minutes.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-[0.72rem] font-bold uppercase tracking-[1.5px] text-[#475569]">Product</h4>
              <ul className="flex flex-col gap-2.5">
                {[["Features", "#features"], ["How It Works", "#how"], ["Pricing", "#pricing"], ["Demo", "#demo"]].map(([l, h]) => (
                  <li key={l}><a href={h} className="text-[0.84rem] text-[#94A3B8] transition-colors hover:text-white">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-[0.72rem] font-bold uppercase tracking-[1.5px] text-[#475569]">Industries</h4>
              <ul className="flex flex-col gap-2.5">
                {["Clinics", "Schools", "Restaurants", "Salons & Gyms"].map((l) => (
                  <li key={l}><a href="#industries" className="text-[0.84rem] text-[#94A3B8] transition-colors hover:text-white">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-[0.72rem] font-bold uppercase tracking-[1.5px] text-[#475569]">Company</h4>
              <ul className="flex flex-col gap-2.5">
                <li><a href="#waitlist" className="text-[0.84rem] text-[#94A3B8] transition-colors hover:text-white">Contact Us</a></li>
                <li><a href="/privacy-policy" className="text-[0.84rem] text-[#94A3B8] transition-colors hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-[0.84rem] text-[#94A3B8] transition-colors hover:text-white">Terms of Use</a></li>
                <li><a href="#faq" className="text-[0.84rem] text-[#94A3B8] transition-colors hover:text-white">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[#1E293B] pt-7">
            <p className="text-[0.78rem] text-[#475569]">© 2026 Agent.Kiteum — All rights reserved</p>
            <p className="text-[0.78rem] text-[#475569]">Made with ❤️ for Indian small businesses</p>
          </div>
        </div>
      </footer>
    </>
  );
}