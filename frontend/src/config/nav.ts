import { 
  LayoutDashboard, 
  FolderOpen, 
  Database, 
  Settings, 
  Printer,
  Box
} from "lucide-react"

export const sidebarItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Studio",
    href: "/dashboard/studio",
    icon: Box,
  },
  {
    title: "Datasets",
    href: "/dashboard/datasets",
    icon: Database,
  },
  {
    title: "Slicer Profiles",
    href: "/dashboard/profiles",
    icon: Settings,
  },
  {
    title: "Printers",
    href: "/dashboard/printers",
    icon: Printer,
  },
]
