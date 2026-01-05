"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import SlicerScene from "@/components/studio/slicer-scene"
import { StudioSidebar } from "@/components/studio/sidebar"
import { toast } from "sonner"

export default function StudioPage() {
  const activeVolume = { x: 256, y: 256, z: 256 }
  const [activeFile, setActiveFile] = useState<File | null>(null)
  
  const handleFileSelect = (file: File) => {
      setActiveFile(file)
      toast.success(`Loaded: ${file.name}`)
  }

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
      
      {/* 1. Sidebar Controls */}
      <Card className="h-full border-none shadow-none rounded-none w-auto md:w-80 flex-shrink-0">
          <StudioSidebar onFileSelect={handleFileSelect} />
      </Card>
      
      {/* 2. Main 3D View */}
      <div className="flex-1 relative h-full min-h-[500px] rounded-xl overflow-hidden shadow-sm border">
          <SlicerScene volume={activeVolume} />
      </div>

    </div>
  )
}
