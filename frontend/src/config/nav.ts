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
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderOpen,
  },
  {
    title: "Studio",
    href: "/studio",
    icon: Box,
  },
  {
    title: "Datasets",
    href: "/datasets",
    icon: Database,
  },
  {
    title: "Profiles",
    href: "/profiles",
    icon: Settings,
  },
  {
    title: "My Printers",
    href: "/printers",
    icon: Printer,
  },
]
