"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { sidebarItems } from "@/config/nav"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Mobile navigation menu for accessing dashboard features.
        </SheetDescription>
        
        <div className="flex h-14 items-center border-b px-2 font-semibold tracking-tight">
          <span className="mr-2 rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">SC</span>
          SprueCrafter Studio
        </div>
        
        <nav className="grid gap-2 text-lg font-medium py-4">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={index}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  pathname === item.href 
                    ? "bg-muted text-foreground" 
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>
        
        <div className="mt-auto border-t pt-4">
             <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-lg font-medium text-muted-foreground hover:text-primary"
              >
                <Settings className="h-5 w-5" />
                Settings
            </Link>
             <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-lg font-medium text-red-500 hover:bg-red-500/10 hover:text-red-600">
                <LogOut className="h-5 w-5" />
                Log Out
            </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
