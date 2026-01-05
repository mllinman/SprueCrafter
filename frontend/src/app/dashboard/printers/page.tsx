"use client"

import { Button } from "@/components/ui/button"
import { Plus, PrinterIcon, Settings, Box } from "lucide-react"
import { PrinterForm } from "@/components/printers/printer-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function PrintersPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Printers</h2>
          <p className="text-muted-foreground">Manage your 3D printers and build volumes.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Printer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Printer</DialogTitle>
              <DialogDescription>
                Define your printer's specifications and build volume.
              </DialogDescription>
            </DialogHeader>
            <PrinterForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Mock Data for Display */}
        <Card className="relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <PrinterIcon className="w-24 h-24" />
             </div>
            <CardHeader>
                <CardTitle>Ender 3 V2</CardTitle>
                <CardDescription>Creality • Marlin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Box className="w-4 h-4" />
                    <span>Volume: 220 x 220 x 250 mm</span>
                 </div>
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Settings className="w-4 h-4" />
                    <span>Nozzle: 0.4mm</span>
                 </div>
            </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-primary/50 bg-primary/5">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <PrinterIcon className="w-24 h-24" />
             </div>
             <div className="absolute top-2 right-2">
                 <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">Active</span>
             </div>
            <CardHeader>
                <CardTitle>Bambu Lab X1C</CardTitle>
                <CardDescription>Bambu Lab • Klipper-ish</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Box className="w-4 h-4" />
                    <span>Volume: 256 x 256 x 256 mm</span>
                 </div>
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Settings className="w-4 h-4" />
                    <span>Nozzle: 0.4mm</span>
                 </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
