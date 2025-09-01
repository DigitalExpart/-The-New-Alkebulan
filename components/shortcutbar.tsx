"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronUp,
  ChevronDown,
  FlaskConical,
  Calendar,
  TrendingUp,
  BookOpen,
  Users,
  MessageSquare,
  Store,
  LineChart,
  Star,
  UserCircle,
  GraduationCap,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";

const menuItems = [
  { label: "Manifest Lab", icon: FlaskConical, link: "/growth/manifest-lab" },
  { label: "Daily Planner", icon: Calendar, link: "/growth//daily-planner" },
  { label: "Progress", icon: TrendingUp, link: "/growth//progress" },
  { label: "Learning", icon: BookOpen, link: "/growth//learning" },
  { label: "Social Feed", icon: MessageSquare, link: "/community" },
  { label: "My Community", icon: Users, link: "/community/my-communities" },
  { label: "Market Place", icon: Store, link: "/marketplace" },
  { label: "Investing", icon: LineChart, link: "/investing" },
  { label: "My Alkebulan", icon: Star, link: "/my-alkebulan" },
  { label: "Mentorship", icon: GraduationCap, link: "/growth/mentorship" },
  { label: "Events", icon: CalendarDays, link: "/community/events" },
  { label: "My Profile", icon: UserCircle, link: "/profile" },
];

export default function ShortcutBar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Toggle Button (keeps right alignment as before) */}
      <div className="w-full flex justify-end ">
        <button
          aria-expanded={isOpen}
          aria-label={isOpen ? "Collapse shortcuts" : "Expand shortcuts"}
          className="bg-dark-bg dark:bg-dark-card text-white py-1 px-6 rounded-t-lg shadow-md md:flex md:justify-center md:items-center border border-b-0 border-accent/40 lg:animate-pulse"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDown size={34} /> : <ChevronUp size={34} />}
        </button>
      </div>

      {/* Animated Shortcut Bar */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="overflow-hidden w-full bg-dark-bg dark:bg-dark-card shadow-lg"
      >
        
        <div className="grid grid-cols-3 gap-2 p-2 md:flex md:justify-around md:items-center md:h-16 md:px-4">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.link}
                className="flex flex-col items-center justify-center text-xs lg:text-sm text-gray-300 hover:text-amber-400 transition-colors py-2 rounded lg:border-r lg:border-l lg:border-opacity-25 lg:p-3 lg:border-white"
              >
                <Icon size={18} className="mb-1" />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
