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
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

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
      quality: { 
        layerHeight: 0.2, 
        firstLayerHeight: 0.2,
        lineWidth: 0.4,
        wallLineCount: 3,
        ironing: false,
        fuzzySkin: false,
        vaseMode: false,
        arachneEngine: true
      },
      infill: { density: 20, pattern: "Grid" },
      geometry: {
        meshRepair: true,
        hollowing: false,
        drainHoles: false,
        autoOrientation: false,
        supportType: "Normal",
        supportDensity: 15,
        supportInterface: true,
      },
      motion: {
         printSpeed: 60,
         outerWallSpeed: 30,
         innerWallSpeed: 45,
         travelSpeed: 150,
         acceleration: 500,
         jerk: 8,
         pressureAdvance: 0,
         retractionEnabled: true,
         zHop: false,
      },
      adhesion: { type: "Skirt", brimWidth: 0 },
      advanced: {
        multiMaterial: false,
        primeTower: false,
        oozeShield: false,
        klipperSupport: false,
        costEstimation: true,
      }
    },
  })

  function onSubmit(data: SlicerProfile) {
    console.log(data)
    toast.success("Profile saved/updated successfully")
    if (onSuccess) onSuccess()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Header Fields - Always Visible */}
        <div className="grid grid-cols-2 gap-4">
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
                        <FormLabel>Target Slicer</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a slicer" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="UltiMaker Cura">UltiMaker Cura</SelectItem>
                                <SelectItem value="Orca Slicer">OrcaSlicer</SelectItem>
                                <SelectItem value="PrusaSlicer">PrusaSlicer</SelectItem>
                                <SelectItem value="Bambu Studio">Bambu Studio</SelectItem>
                                <SelectItem value="Simplify3D">Simplify3D</SelectItem>
                                <SelectItem value="ChiTuBox">ChiTuBox</SelectItem>
                                <SelectItem value="KISSlicer">KISSlicer</SelectItem>
                                <SelectItem value="Lychee Slicer">Lychee Slicer</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <Tabs defaultValue="quality" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="quality">Quality</TabsTrigger>
                <TabsTrigger value="geometry">Geometry</TabsTrigger>
                <TabsTrigger value="motion">Motion</TabsTrigger>
                <TabsTrigger value="advanced">Multi-Mat</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-[400px] border rounded-md p-4 mt-2">
                
                {/* QUALITY TAB */}
                <TabsContent value="quality" className="space-y-4">
                     <Card>
                        <CardHeader><CardTitle>Layers & Perimeters</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="quality.layerHeight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Layer Height (mm)</FormLabel>
                                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="quality.firstLayerHeight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Layer (mm)</FormLabel>
                                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="quality.lineWidth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Line Width (mm)</FormLabel>
                                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="quality.wallLineCount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Wall Loops</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                     </Card>

                    <Card>
                        <CardHeader><CardTitle>Surface Finish</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quality.ironing"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Ironing</FormLabel>
                                            <FormDescription>Smooth top surfaces</FormDescription>
                                        </div>
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="quality.fuzzySkin"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Fuzzy Skin</FormLabel>
                                            <FormDescription>Textured outer walls</FormDescription>
                                        </div>
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="quality.vaseMode"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Vase Mode</FormLabel>
                                            <FormDescription>Spiralize Contour</FormDescription>
                                        </div>
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}
                            />
                              <FormField
                                control={form.control}
                                name="quality.arachneEngine"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Arachne Engine</FormLabel>
                                            <FormDescription>Adaptive wall width</FormDescription>
                                        </div>
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* GEOMETRY TAB */}
                <TabsContent value="geometry" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Supports</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="geometry.supportType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Support Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="None">None</SelectItem>
                                                <SelectItem value="Normal">Normal (Grid)</SelectItem>
                                                <SelectItem value="Tree">Tree (Cura)</SelectItem>
                                                <SelectItem value="Organic">Organic (Prusa)</SelectItem>
                                                <SelectItem value="Paint-on">Paint-on</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="geometry.supportDensity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Density (%)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader><CardTitle>Mesh Processing (Resin/Advanced)</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="geometry.hollowing"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Hollowing</FormLabel>
                                            <FormDescription>Hollow model interior</FormDescription>
                                        </div>
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="geometry.meshRepair"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Auto Repair</FormLabel>
                                            <FormDescription>Fix non-manifold mesh</FormDescription>
                                        </div>
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                     </Card>
                </TabsContent>

                 {/* MOTION TAB */}
                <TabsContent value="motion" className="space-y-4">
                     <Card>
                        <CardHeader><CardTitle>Speed (mm/s)</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="motion.printSpeed"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Base Print Speed</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="motion.travelSpeed"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Travel Speed</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Dynamics</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="motion.acceleration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Acceleration (mm/s²)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="motion.pressureAdvance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pressure Advance (K-factor)</FormLabel>
                                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ADVANCED TAB */}
                <TabsContent value="advanced" className="space-y-4">
                      <Card>
                        <CardHeader><CardTitle>Multi-Material & Workflow</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <FormField
                                control={form.control}
                                name="advanced.multiMaterial"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Multi-Material (AMS/MMU)</FormLabel>
                                            <FormDescription>Enable purge and toolchange logic</FormDescription>
                                        </div>
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="advanced.primeTower"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Prime Tower</FormLabel>
                                            </div>
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="advanced.klipperSupport"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Klipper Firmware</FormLabel>
                                            </div>
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                 {/* NOTES TAB */}
                 <TabsContent value="notes" className="space-y-4">
                    <FormField
                        control={form.control}
                        name="advanced.notes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Profile Notes</FormLabel>
                                <FormControl>
                                    <Textarea 
                                        placeholder="Add specific notes about this profile (e.g. 'Optimized for brand X filament')..." 
                                        className="h-32" 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </TabsContent>

            </ScrollArea>
        </Tabs>

        <Button type="submit">Save Profile</Button>
      </form>
    </Form>
  )
}
