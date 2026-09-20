"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getUser, logout, saveAuth, getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Buoc 1: hien thi ngay tu cookie (nhanh, khong bi flickering)
    const cached = getUser();
    if (cached) setUser(cached);

    // Buoc 2: dong bo voi DB qua API /auth/me de cap nhat role moi nhat
    const token = getToken();
    if (!token) return;

    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        // Cap nhat lai cookie neu role hoac thong tin thay doi
        if (cached?.role !== data.role || cached?.name !== data.name) {
          saveAuth(token, {
            id:     data._id || data.id,
            email:  data.email,
            name:   data.name,
            role:   data.role,
            avatar: data.avatar,
          });
        }
        setUser({ ...data, id: data._id || data.id });
      })
      .catch(() => {}); // loi mang thi giu nguyen cache
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    { href: "/",          label: "Chat" },
    { href: "/documents", label: "Tai lieu" },
    { href: "/admin",     label: "Admin", adminOnly: true },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-blue-600 font-bold text-lg flex items-center gap-2">
          <span className="text-xl">AI</span>
          <span className="text-gray-800">IAM</span>
        </Link>
        <div className="flex gap-1">
          {navItems.map((item) => {
            if (item.adminOnly && user?.role !== "admin") return null;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href))
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item.label}
                {item.href === "/admin" && (
                  <span className="ml-1.5 bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2">
            {/* Avatar */}
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
        )}
        {user?.role === "admin" && (
          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
            Admin
          </span>
        )}
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 ml-1"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
