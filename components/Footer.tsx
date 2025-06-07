"use client";
import { 
  HomeIcon, 
 // ArchiveBoxArrowDownIcon, 
 // UserGroupIcon, 
 // UserIcon 
} from "@heroicons/react/24/outline";
import { cn } from "../lib/utils";
import { useRouter, usePathname } from "next/navigation";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;


  return (
    <footer className="sm:hidden fixed bottom-0 w-full backdrop-blur-md bg-white/70">
      <div className="flex justify-around py-3 text">
        

      </div>
    </footer>
  );
}