'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image"

export function Navbar() {
  const pathname = usePathname()
  const isRoot = pathname === "/"
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#2A2625] bg-[#0A0A0A]/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            {isRoot ? (
              <Image
                src="https://app.fomoed.io/fomoed2.svg"
                alt="Fomoed"
                width={120}
                height={40}
                className="dark:invert-0"
              />
            ) : (
              <Image
                src="https://app.fomoed.io/icons/small-logo.svg"
                alt="Fomoed"
                width={40}
                height={40}
                className="dark:invert-0"
              />
            )}
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/project-owners"
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-[#C85627]",
                pathname.startsWith("/project-owners")
                  ? "text-[#C85627]"
                  : "text-muted-foreground"
              )}
            >
              Project Owners & Community Managers
            </Link>
            <Link
              href="/creators"
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-[#C85627]",
                pathname.startsWith("/creators")
                  ? "text-[#C85627]"
                  : "text-muted-foreground"
              )}
            >
              KOLs & Creators
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="https://app.fomoed.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#C85627] to-[#FF7A42] rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(200,86,39,0.3)] hover:scale-[1.02] active:scale-[0.98]"
          >
            Main Site
          </Link>
          <nav className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#2A2625] text-muted-foreground transition-colors hover:text-[#C85627]"
              aria-label="Toggle Menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn("h-5 w-5 transition-transform", 
                  isMobileMenuOpen && "transform rotate-90"
                )}
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#2A2625] bg-[#0A0A0A]/95 backdrop-blur-sm">
          <div className="container py-4 space-y-4">
            <Link
              href="/project-owners"
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-[#C85627] py-2",
                pathname.startsWith("/project-owners")
                  ? "text-[#C85627]"
                  : "text-muted-foreground"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Project Owners & Community Managers
            </Link>
            <Link
              href="/creators"
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-[#C85627] py-2",
                pathname.startsWith("/creators")
                  ? "text-[#C85627]"
                  : "text-muted-foreground"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              KOLs & Creators
            </Link>
            <Link
              href="https://app.fomoed.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#C85627] to-[#FF7A42] rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(200,86,39,0.3)] w-full justify-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Main Site
            </Link>
          </div>
        </div>
      )}
    </header>
  )
} 