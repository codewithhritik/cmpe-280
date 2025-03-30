"use client"

import { Home, Settings, HelpCircle, BarChart4 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  return (
    <div className="w-16 border-r bg-background flex flex-col items-center py-4">
      <div className="mb-8">
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <BarChart4 className="h-6 w-6" />
        </Button>
      </div>
      <nav className="flex flex-col items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="h-10 w-10 bg-muted">
          <Home className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </nav>
      <Button variant="ghost" size="icon" className="h-10 w-10 mt-auto">
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  )
}

