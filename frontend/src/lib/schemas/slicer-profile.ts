import * as z from "zod"

export const slicerProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  targetSlicer: z.enum([
    "UltiMaker Cura", 
    "Orca Slicer", 
    "PrusaSlicer", 
    "Simplify3D", 
    "KISSlicer", 
    "Lychee Slicer",
    "Other"
  ]),
  quality: z.object({
    layerHeight: z.coerce.number().min(0.01).max(1.0).default(0.2),
    lineWidth: z.coerce.number().min(0.1).max(2.0).default(0.4),
    printSpeed: z.coerce.number().min(10).max(500).default(60),
  }),
  infill: z.object({
    density: z.coerce.number().min(0).max(100).default(20),
    pattern: z.enum(["Grid", "Honeycomb", "Gyroid", "Triangles", "Lines"]).default("Grid"),
  }),
  supports: z.object({
    enabled: z.boolean().default(false),
    type: z.enum(["Automatic", "Manual", "Tree", "Normal"]).default("Normal"),
    overhangAngle: z.coerce.number().min(0).max(90).default(45),
  }),
  adhesion: z.object({
    type: z.enum(["None", "Skirt", "Brim", "Raft"]).default("Skirt"),
  }),
})

export type SlicerProfile = z.infer<typeof slicerProfileSchema>
