"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Upload, Box, Shield, Zap, Scissors } from "lucide-react"

export function StudioSidebar({ 
    onFileSelect,
    isProcessing 
}: { 
    onFileSelect: (file: File) => void,
    isProcessing?: boolean
}) {
    const [activeTab, setActiveTab] = useState("import")

    // Mock handlers for now - in reality these would trigger the API calls directly or via a parent
    const handleAction = (action: string) => {
        console.log("Action triggered:", action)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0])
        }
    }

  return (
    <div className="w-80 border-r bg-background flex flex-col h-full">
        <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Tools</h2>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
             <div className="px-4 pt-2">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="import"><Upload className="w-4 h-4" /></TabsTrigger>
                    <TabsTrigger value="modify"><Box className="w-4 h-4" /></TabsTrigger>
                    <TabsTrigger value="supports"><Shield className="w-4 h-4" /></TabsTrigger>
                    <TabsTrigger value="sprue"><Zap className="w-4 h-4" /></TabsTrigger>
                </TabsList>
             </div>

             <ScrollArea className="flex-1 p-4">
                 
                 {/* IMPORT TAB */}
                 <TabsContent value="import" className="space-y-6 mt-0">
                     <div className="space-y-4">
                        <Label>Import 3D Model</Label>
                        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors">
                            <Input 
                                type="file" 
                                className="hidden" 
                                id="file-upload" 
                                accept=".stl,.obj,.glb,.gltf"
                                onChange={handleFileChange}
                            />
                            <Label htmlFor="file-upload" className="cursor-pointer space-y-2 flex flex-col items-center">
                                <Upload className="w-8 h-8 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Click to browse or drag file</span>
                            </Label>
                        </div>
                     </div>

                     <div className="space-y-4">
                         <Label>Photo Scans</Label>
                         <Button variant="outline" className="w-full">
                             Process Photos to 3D
                         </Button>
                     </div>
                 </TabsContent>

                 {/* MODIFY TAB */}
                 <TabsContent value="modify" className="space-y-6 mt-0">
                     <div className="space-y-4">
                         <h3 className="font-medium text-sm text-muted-foreground uppercase">Scaling</h3>
                         <div className="grid grid-cols-2 gap-2">
                             <Button variant="outline" size="sm" onClick={() => handleAction("scale-1/35")}>1/35 (Armor)</Button>
                             <Button variant="outline" size="sm" onClick={() => handleAction("scale-1/48")}>1/48 (Air)</Button>
                             <Button variant="outline" size="sm" onClick={() => handleAction("scale-1/72")}>1/72 (Small)</Button>
                             <Button variant="outline" size="sm" onClick={() => handleAction("scale-1/144")}>1/144 (Micro)</Button>
                         </div>
                         <div className="space-y-2">
                             <Label>Custom Scale Factor</Label>
                             <Input type="number" step="0.01" defaultValue="1.0" />
                         </div>
                         <Button className="w-full" disabled={isProcessing}>
                             {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : "Apply Scale"}
                         </Button>
                     </div>

                     <div className="space-y-4">
                         <h3 className="font-medium text-sm text-muted-foreground uppercase">Transform</h3>
                         <div className="space-y-2">
                             <Label>Rotation (Z-Axis)</Label>
                             <Slider defaultValue={[0]} max={360} step={1} />
                         </div>
                     </div>
                     
                     <div className="space-y-4">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase">Preparation</h3>
                        <Button variant="secondary" className="w-full" onClick={() => handleAction("separate")}>
                            <Scissors className="w-4 h-4 mr-2" />
                             Separate Parts (AI)
                        </Button>
                     </div>
                 </TabsContent>

                 {/* SUPPORTS TAB */}
                 <TabsContent value="supports" className="space-y-6 mt-0">
                     <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <Label>Auto-Support</Label>
                            <Switch defaultChecked />
                         </div>
                         
                         <div className="space-y-2">
                             <Label>Overhang Angle (45°)</Label>
                             <Slider defaultValue={[45]} max={90} step={1} />
                         </div>

                         <div className="space-y-2">
                             <Label>Density</Label>
                             <Select defaultValue="medium">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                             </Select>
                         </div>

                         <Button className="w-full" disabled={isProcessing}>
                             Generate Supports
                         </Button>
                     </div>
                     
                     <Card className="bg-muted/50">
                         <CardContent className="p-4 text-xs text-muted-foreground">
                             Manual support painting is available in the 3D view using Right-Click.
                         </CardContent>
                     </Card>
                 </TabsContent>

                 {/* SPRUE TAB */}
                 <TabsContent value="sprue" className="space-y-6 mt-0">
                     <div className="space-y-4">
                         <div className="space-y-2">
                             <Label>Target Printer</Label>
                             <Select defaultValue="saturn">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="saturn">Elegoo Saturn</SelectItem>
                                    <SelectItem value="mars">Elegoo Mars 3</SelectItem>
                                    <SelectItem value="photon">Anycubic Photon</SelectItem>
                                    <SelectItem value="custom">Custom Volume</SelectItem>
                                </SelectContent>
                             </Select>
                         </div>

                         <div className="space-y-2">
                             <Label>Connector Type</Label>
                             <Select defaultValue="cylindrical">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cylindrical">Cylindrical</SelectItem>
                                    <SelectItem value="pyramid">Pyramid</SelectItem>
                                    <SelectItem value="triangular">Triangular</SelectItem>
                                    <SelectItem value="spherical">Spherical</SelectItem>
                                </SelectContent>
                             </Select>
                         </div>

                         <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isProcessing}>
                             <Zap className="w-4 h-4 mr-2" />
                             Generate Sprue
                         </Button>
                     </div>
                 </TabsContent>

             </ScrollArea>
        </Tabs>
    </div>
  )
}
