"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { slicerProfileSchema, type SlicerProfile } from "@/lib/schemas/slicer-profile"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function ProfileForm({ 
  defaultValues, 
  onSuccess 
}: { 
  defaultValues?: Partial<SlicerProfile>,
  onSuccess?: () => void 
}) {
  const form = useForm<SlicerProfile>({
    resolver: zodResolver(slicerProfileSchema) as any,
    defaultValues: defaultValues || {
      name: "",
      targetSlicer: "UltiMaker Cura",
      quality: { layerHeight: 0.2, lineWidth: 0.4, printSpeed: 60 },
      infill: { density: 20, pattern: "Grid" },
      supports: { enabled: false, type: "Normal", overhangAngle: 45 },
      adhesion: { type: "Skirt" },
    },
  })

  function onSubmit(data: SlicerProfile) {
    console.log(data)
    toast.success("Profile saved successfully")
    if (onSuccess) onSuccess()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. High Quality PLA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetSlicer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Slicer Software</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a slicer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="UltiMaker Cura">UltiMaker Cura</SelectItem>
                  <SelectItem value="Orca Slicer">Orca Slicer</SelectItem>
                  <SelectItem value="PrusaSlicer">PrusaSlicer</SelectItem>
                  <SelectItem value="Simplify3D">Simplify3D</SelectItem>
                  <SelectItem value="KISSlicer">KISSlicer</SelectItem>
                  <SelectItem value="Lychee Slicer">Lychee Slicer</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>The software this profile is optimized for.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Quality Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quality Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="quality.layerHeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Layer Height (mm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quality.printSpeed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Print Speed (mm/s)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Infill Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Infill & Adhesion</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="infill.density"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Infill %</FormLabel>
                            <FormControl>
                            <Input type="number" min="0" max="100" {...field} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="infill.pattern"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pattern</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Grid">Grid</SelectItem>
                                    <SelectItem value="Gyroid">Gyroid</SelectItem>
                                    <SelectItem value="Honeycomb">Honeycomb</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="adhesion.type"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Build Plate Adhesion</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="None">None</SelectItem>
                                <SelectItem value="Skirt">Skirt</SelectItem>
                                <SelectItem value="Brim">Brim</SelectItem>
                                <SelectItem value="Raft">Raft</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                    )}
                />
            </CardContent>
          </Card>
        </div>

        <Button type="submit">Save Profile</Button>
      </form>
    </Form>
  )
}
