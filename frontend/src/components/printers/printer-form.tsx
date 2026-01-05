"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { printerSchema, type Printer } from "@/lib/schemas/printer"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PrinterForm({ 
  defaultValues, 
  onSuccess 
}: { 
  defaultValues?: Partial<Printer>,
  onSuccess?: () => void 
}) {
  const form = useForm<Printer>({
    resolver: zodResolver(printerSchema) as any,
    defaultValues: defaultValues || {
      name: "",
      make: "",
      model: "",
      firmware: "Marlin",
      buildVolume: { x: 220, y: 220, z: 250 },
      nozzleDiameter: 0.4,
      filamentDiameter: 1.75,
    },
  })

  function onSubmit(data: Printer) {
    console.log(data)
    toast.success("Printer saved successfully")
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
              <FormLabel>Printer Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. My Ender 3" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                        <Input placeholder="Creality" {...field} />
                    </FormControl>
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                        <Input placeholder="Ender 3 V2" {...field} />
                    </FormControl>
                    </FormItem>
                )}
            />
        </div>

        <FormField
            control={form.control}
            name="firmware"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Firmware Flavor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Marlin">Marlin</SelectItem>
                            <SelectItem value="Klipper">Klipper</SelectItem>
                            <SelectItem value="RepRap">RepRap</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                     <FormDescription>Affects generated G-code syntax.</FormDescription>
                </FormItem>
            )}
        />

        <Card>
            <CardHeader><CardTitle className="text-base">Build Volume (mm)</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
                 <FormField
                    control={form.control}
                    name="buildVolume.x"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>X Width</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="buildVolume.y"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Y Depth</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="buildVolume.z"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Z Height</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

         <div className="grid grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="nozzleDiameter"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nozzle Diameter (mm)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="filamentDiameter"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Filament Diameter (mm)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    </FormItem>
                )}
            />
        </div>

        <Button type="submit">Save Printer</Button>
      </form>
    </Form>
  )
}
