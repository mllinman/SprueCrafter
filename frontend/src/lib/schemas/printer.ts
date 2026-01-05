import * as z from "zod"

export const printerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  make: z.string().optional(),
  model: z.string().optional(),
  firmware: z.enum(["Marlin", "Klipper", "RepRap", "Other"]).default("Marlin"),
  buildVolume: z.object({
    x: z.coerce.number().min(1).default(220),
    y: z.coerce.number().min(1).default(220),
    z: z.coerce.number().min(1).default(250),
  }),
  nozzleDiameter: z.coerce.number().min(0.1).max(2.0).default(0.4),
  filamentDiameter: z.coerce.number().min(1.0).max(4.0).default(1.75),
})

export type Printer = z.infer<typeof printerSchema>
