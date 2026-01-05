"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
      <Button variant="outline" size="icon" className="md:hidden">
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle navigation</span>
      </Button>
      <div className="w-full flex-1">
        {/* Search Placeholder */}
        <form>
          <div className="relative">
            {/* <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            /> */}
          </div>
        </form>
      </div>
      <div className="flex items-center gap-2">
         {/* User Nav Placeholder */}
         <div className="h-8 w-8 rounded-full bg-slate-200"></div>
      </div>
    </header>
  )
}
