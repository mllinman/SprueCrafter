"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { sidebarItems } from "@/config/nav"
import { Settings, LogOut } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-14 items-center border-b px-6 font-semibold tracking-tight">
        <span className="mr-2 rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">SC</span>
        SprueCrafter Studio
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  pathname === item.href 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
      
      <div className="border-t p-4">
        <nav className="grid items-start gap-2">
            <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-primary"
                )}
              >
                <Settings className="h-4 w-4" />
                Settings
            </Link>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-500/10 hover:text-red-600">
                <LogOut className="h-4 w-4" />
                Log Out
            </button>
        </nav>
      </div>
    </aside>
  )
}
