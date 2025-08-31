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
    <div className="fixed bottom-0 left-0 right-0 flex flex-col items-center">
      {/* Toggle Button or Chevron */}
      

      <div className="w-full flex justify-end pr-4">
        <button
          className="bg-gray-900 dark:bg-dark-card text-white py-1 px-6 rounded-t-lg shadow-md flex justify-center items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDown size={34} /> : <ChevronUp size={34} />}
        </button>
      </div>

      {/* Animated Shortcut Bar */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: isOpen ? "4rem" : 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="overflow-hidden w-full bg-gray-900 dark:bg-dark-card shadow-lg"
      >
        <div className="flex justify-around items-center h-16 px-4">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                className="flex flex-col items-center text-xs lg:text-sm text-gray-300 hover:text-amber-400 transition-colors"
              >
                <Link href={`${item.link}`}>
                  <Icon size={18} className="mb-1" />
                  {item.label}
                </Link>
                    
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
