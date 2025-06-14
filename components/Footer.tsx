"use client";
import { 
  HomeIcon, 
  ArchiveBoxArrowDownIcon, 
  UserGroupIcon, 
  UserIcon 
} from "@heroicons/react/24/outline";
import { cn } from "../lib/utils";
import { useRouter, usePathname } from "next/navigation";
import ClaimsFooter from "./ClaimsFooter";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;

  return (
    <>
      <footer className="sm:hidden fixed bottom-0 w-full">
        <div className="flex justify-around py-3 text">
          <button
            onClick={() => router.push('/')}
            className={cn(
              "flex flex-col items-center px-4 py-2 rounded-md transition-colors",
              isActive('/') ? "text-purple-600" : "text-gray-500 hover:text-purple-500"
            )}
          >
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </button>
        </div>
      </footer>
      
      {/* Claims display that shows on all pages */}
      <ClaimsFooter />
    </>
  );
}