"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { 
  LogOut, User, Settings, ChevronDown, 
  BarChart3, DownloadCloud, ShieldCheck 
} from "lucide-react";

interface UserNavProps {
  email: string;
  role?: string;
}

export function UserNav({ email, role }: UserNavProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const initials = email
    .split("@")[0]
    .split(/[._\-]/)
    .map(p => p[0]?.toUpperCase() || "")
    .slice(0, 2)
    .join("") || email[0]?.toUpperCase() || "U";

  return (
    <div className="relative" ref={ref}>
      {/* Avatar Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all group"
      >
        <div className="h-8 w-8 rounded-lg bg-[#3b82f6] flex items-center justify-center text-white text-xs font-bold shadow-sm">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col items-start leading-none">
          <span className="text-[11px] font-bold text-slate-700 max-w-[140px] truncate">{email}</span>
          {role && (
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">{role}</span>
          )}
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#3b82f6] flex items-center justify-center text-white font-bold shadow-sm">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{email}</p>
                <p className="text-[10px] text-[#3b82f6] font-semibold uppercase tracking-wide mt-0.5">
                  {role || "User"} Account
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1.5">
            <Link
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 hover:text-[#3b82f6] transition-colors group"
            >
              <div className="h-7 w-7 rounded-md bg-slate-100 group-hover:bg-[#3b82f6]/10 flex items-center justify-center transition-colors">
                <User size={13} className="text-slate-500 group-hover:text-[#3b82f6]" />
              </div>
              <div>
                <p className="font-semibold leading-none">My Profile</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Account details & settings</p>
              </div>
            </Link>

            <Link
              href="/downloads"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 hover:text-[#3b82f6] transition-colors group"
            >
              <div className="h-7 w-7 rounded-md bg-slate-100 group-hover:bg-[#3b82f6]/10 flex items-center justify-center transition-colors">
                <DownloadCloud size={13} className="text-slate-500 group-hover:text-[#3b82f6]" />
              </div>
              <div>
                <p className="font-semibold leading-none">Downloads</p>
                <p className="text-[10px] text-slate-400 mt-0.5">View exported files</p>
              </div>
            </Link>

            {role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 hover:text-[#3b82f6] transition-colors group"
              >
                <div className="h-7 w-7 rounded-md bg-slate-100 group-hover:bg-[#3b82f6]/10 flex items-center justify-center transition-colors">
                  <ShieldCheck size={13} className="text-slate-500 group-hover:text-[#3b82f6]" />
                </div>
                <div>
                  <p className="font-semibold leading-none">Admin Panel</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Manage scraper & system</p>
                </div>
              </Link>
            )}
          </div>

          {/* Logout */}
          <div className="p-1.5 border-t border-slate-100">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors group"
            >
              <div className="h-7 w-7 rounded-md bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                <LogOut size={13} className="text-red-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold leading-none">Sign Out</p>
                <p className="text-[10px] text-red-400 mt-0.5">End this session</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
