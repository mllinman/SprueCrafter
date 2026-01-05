"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ProfileForm } from "@/components/profiles/profile-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function ProfilesPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Slicer Profiles</h2>
          <p className="text-muted-foreground">Manage configurations for your preferred slicing software.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Slicer Profile</DialogTitle>
              <DialogDescription>
                Define core slicing parameters according to your software preferences.
              </DialogDescription>
            </DialogHeader>
            <ProfileForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Mock Data for Display */}
        <Card>
            <CardHeader>
                <CardTitle>Cura Fine Detail</CardTitle>
                <CardDescription>UltiMaker Cura • 0.12mm</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
                <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Infill:</span>
                    <span>20% Grid</span>
                    <span className="text-muted-foreground">Adhesion:</span>
                    <span>Brim</span>
                    <span className="text-muted-foreground">Speed:</span>
                    <span>50 mm/s</span>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Orca Speed Draft</CardTitle>
                <CardDescription>Orca Slicer • 0.28mm</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
                <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Infill:</span>
                    <span>15% Gyroid</span>
                    <span className="text-muted-foreground">Adhesion:</span>
                    <span>Skirt</span>
                    <span className="text-muted-foreground">Speed:</span>
                    <span>120 mm/s</span>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
