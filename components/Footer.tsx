"use client";
import { 
  HomeIcon, 
 // ArchiveBoxArrowDownIcon, 
 // UserGroupIcon, 
 // UserIcon 
} from "@heroicons/react/24/outline";
import { cn } from "../lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { GiftIcon } from "lucide-react";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;
  
  const navItems = [
    { name: "Home", icon: HomeIcon, path: "/", ariaLabel: "Navigate to home" },
    { name: "Mystery Box", icon: GiftIcon, path: "/mystery-box", ariaLabel: "Open mystery box" },
];

  return (
    <footer className="sm:hidden fixed bottom-0 w-full backdrop-blur-md bg-white/70 dark:bg-black/70 border-t border-gray-200 dark:border-gray-800 shadow-lg z-40">
      <div className="flex justify-around py-3 text">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className={cn(
                "flex flex-col items-center space-y-1 transition-all duration-200 hover:scale-110",
                "text-xs focus:outline-none",
                active 
                  ? "text-black dark:text-primary font-semibold" 
                  : "text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
              )}
              aria-label={item.ariaLabel}
            >
              <div className={cn(
                "p-1.5 rounded-full transition-all duration-300",
                active 
                  ? "bg-primary/10 ring-2 ring-primary/30" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}>
                <Icon className={cn(
                  "h-5 w-5",
                  active ? "stroke-[2.5px]" : "stroke-[1.5px]"
                )} />
              </div>
              <span className={active ? "font-medium" : ""}>{item.name}</span>
              {active && (
                <span className="absolute bottom-0 w-1 h-1 bg-primary rounded-full"/>
              )}
            </button>
          );
        })}
      </div>
    </footer>
  );
}