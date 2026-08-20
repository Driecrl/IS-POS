/**
 * @uuid         CMP-NAV-001
 * @author       Drie
 * @date         2026/08/18
 * @dependsOn    LIB-AUTH-001
 *
 * @description
 * Shared sidebar navigation used across every authenticated page. Groups
 * links into Operations, Inventory, and Admin (role-gated) sections,
 * highlights the active route, and shows the current user plus a
 * logout action.
 *
 * @whereToUse
 * Import into every page under app/ once a session is confirmed (after
 * getSession() returns non-null). Not used on /login.
 *
 * @whenToUse
 * Use as the persistent left-hand navigation on all authenticated
 * pages, replacing the old per-page Dashboard/Log Out button pairs.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout } from "#lib/auth";
import type { Session } from "#lib/auth/types";
import type { NavbarProps, NavGroup } from "./types";
import "./style.css";

const navGroups: NavGroup[] = [
  {
    title: "Operations",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Point of Sale", href: "/pos" },
      { label: "Order History", href: "/orders" },
    ],
  },
  {
    title: "Inventory",
    links: [
      { label: "Products", href: "/products" },
      { label: "Stock Levels", href: "/stock" },
      { label: "Stock History", href: "/stock-history" },
      { label: "Catalog", href: "/catalog" },
    ],
  },
  {
    title: "Admin",
    links: [
      { label: "Users", href: "/users", adminOnly: true },
      { label: "Reports", href: "/reports", adminOnly: true },
      { label: "Audit Trail", href: "/audit-logs", adminOnly: true },
    ],
  },
];

export default function Navbar({ activePath }: NavbarProps) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSession(getSession());
    setMounted(true);
  }, []);

  const role = session?.user.role;
  const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (!mounted) {
    return <nav className="navbar-sidebar" />;
  }

  return (
    <nav className="navbar-sidebar">
      <div className="navbar-brand">Inventory POS</div>

      {navGroups.map((group) => {
        const visibleLinks = group.links.filter((link) => !link.adminOnly || isAdmin);
        if (visibleLinks.length === 0) return null;

        return (
          <div key={group.title} className="navbar-group">
            <div className="navbar-group-title">{group.title}</div>
            {visibleLinks.map((link) => (
                <a
              
                key={link.href}
                href={link.href}
                className={`navbar-link ${activePath === link.href ? "active" : ""}`}
              >
                {link.label}
              </a>
            ))}
          </div>
        );
      })}

      <div className="navbar-footer">
        {session && (
          <div className="navbar-user">
            <div className="navbar-user-name">{session.user.name}</div>
            <div className="navbar-user-role">{role}</div>
          </div>
        )}
        <button onClick={handleLogout} className="navbar-logout">
          Log Out
        </button>
      </div>
    </nav>
  );
}