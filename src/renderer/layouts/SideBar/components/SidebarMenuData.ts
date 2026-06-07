// src/layouts/components/SidebarMenuData.ts
import {
  LayoutDashboard,
  Users,
  Settings,
  Bell,
  Gamepad2,
  Video,
  History,
  Search,
  Star,
  Flame,
  Clock,
  Radio,
  Bookmark,
  Heart,
  Compass,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface MenuItem {
  path: string;
  name: string;
  icon: LucideIcon;
  category?: string;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    path: "/discovery",
    name: "Discovery",
    icon: Compass,
    category: "core",
  },
  {
    path: "/following",
    name: "Following",
    icon: Users,
    category: "core",
  },
  {
    path: "/browse",
    name: "Browse",
    icon: Search,
    category: "discovery",
    children: [
      { path: "/browse/categories", name: "Categories", icon: Gamepad2 },
      { path: "/browse/top-games", name: "Top Games", icon: Flame },
      { path: "/browse/live", name: "Live Channels", icon: Radio },
      { path: "/browse/clips", name: "Popular Clips", icon: Video },
    ],
  },
  {
    path: "/library",
    name: "Library",
    icon: Bookmark,
    category: "personal",
    children: [
      { path: "/history", name: "Watch History", icon: History },
      { path: "/watch-later", name: "Watch Later", icon: Clock },
      { path: "/subscriptions", name: "Subscriptions", icon: Star },
      { path: "/clips", name: "My Clips", icon: Video },
    ],
  },
  {
    path: "/community",
    name: "Community",
    icon: Heart,
    category: "social",
    children: [
      { path: "/friends", name: "Friends", icon: Users },
      { path: "/whispers", name: "Whispers", icon: Bell },
      // { path: "/notifications", name: "Notifications", icon: Bell },
    ],
  },
  {
    path: "/settings",
    name: "Settings",
    icon: Settings,
    category: "system",
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: LayoutDashboard,
    category: "system",
  },
];

export const categories = [
  { id: "core", name: "Main" },
  { id: "discovery", name: "Discover" },
  { id: "personal", name: "Your Stuff" },
  { id: "social", name: "Community" },
  { id: "system", name: "System" },
];
