"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import UsersTab from "./components/UsersTab";
import RolesTab from "./components/RolesTab";
import DocPermissionsTab from "./components/DocPermissionsTab";
import { getUser } from "@/lib/auth";

const TABS = [
  { id: "users",    label: "Nguoi dung",  icon: "ðŸ‘¥" },
  { id: "roles",    label: "Roles",       icon: "ðŸ”‘" },
  { id: "docperms", label: "Quyen tai lieu", icon: "ðŸ“„" },
];

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState("users");

  useEffect(() => {
    const user = getUser();
    if (user?.role !== "admin") router.push("/");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quan tri he thong</h1>
          <p className="text-gray-500 text-sm mt-1">Quan ly nguoi dung, roles va phan quyen tai lieu</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-xl border border-gray-100 w-fit shadow-sm">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span style={{fontSize:16}}>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "users"    && <UsersTab />}
        {tab === "roles"    && <RolesTab />}
        {tab === "docperms" && <DocPermissionsTab />}
      </div>
    </div>
  );
}