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
    "Bambu Studio",
    "ChiTuBox",
    "Other"
  ]),
  
  // I. Core Slicing & Quality
  quality: z.object({
    layerHeight: z.coerce.number().min(0.01).max(2.0).default(0.2),
    firstLayerHeight: z.coerce.number().min(0.01).max(2.0).default(0.2),
    lineWidth: z.coerce.number().min(0.1).max(5.0).default(0.4),
    wallLineCount: z.coerce.number().min(1).max(10).default(2),
    ironing: z.boolean().default(false),
    fuzzySkin: z.boolean().default(false),
    vaseMode: z.boolean().default(false),
    arachneEngine: z.boolean().default(true),
  }),

  // II. Advanced Geometry & Mesh
  geometry: z.object({
    meshRepair: z.boolean().default(true),
    hollowing: z.boolean().default(false), // Resin specific
    drainHoles: z.boolean().default(false), // Resin specific
    autoOrientation: z.boolean().default(false),
    supportType: z.enum(["None", "Normal", "Tree", "Organic", "Paint-on"]).default("Normal"),
    supportDensity: z.coerce.number().min(0).max(100).default(15),
    supportInterface: z.boolean().default(true),
  }),

  // III. Motion & Speed
  motion: z.object({
    printSpeed: z.coerce.number().min(1).max(1000).default(60),
    outerWallSpeed: z.coerce.number().min(1).max(1000).default(30),
    innerWallSpeed: z.coerce.number().min(1).max(1000).default(45),
    travelSpeed: z.coerce.number().min(10).max(1000).default(150),
    acceleration: z.coerce.number().min(0).max(20000).default(500),
    jerk: z.coerce.number().min(0).max(100).default(8),
    pressureAdvance: z.coerce.number().min(0).max(1).default(0),
    retractionEnabled: z.boolean().default(true),
    zHop: z.boolean().default(false),
  }),

  // IV. Infill & Adhesion (Previously part of Core, but separate category per schema structure)
  infill: z.object({
    density: z.coerce.number().min(0).max(100).default(20),
    pattern: z.enum(["Grid", "Lines", "Triangles", "Tri-Hexagon", "Cubic", "Cubic Subdivision", "Octet", "Quarter Cubic", "Concentric", "Zig Zag", "Cross", "Cross 3D", "Gyroid", "Honeycomb", "Lightning"]).default("Grid"),
  }),
  adhesion: z.object({
    type: z.enum(["None", "Skirt", "Brim", "Raft"]).default("Skirt"),
    brimWidth: z.coerce.number().min(0).max(50).default(0),
  }),

  // V. Multi-Material & Workflow
  advanced: z.object({
    multiMaterial: z.boolean().default(false),
    primeTower: z.boolean().default(false),
    oozeShield: z.boolean().default(false),
    klipperSupport: z.boolean().default(false),
    costEstimation: z.boolean().default(true),
    notes: z.string().optional(),
  }),
})

export type SlicerProfile = z.infer<typeof slicerProfileSchema>
