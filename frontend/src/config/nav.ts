import { 
  LayoutDashboard, 
  FolderOpen, 
  Database, 
  Settings, 
  Printer
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
    title: "Datasets",
    href: "/datasets",
    icon: Database,
  },
  {
    title: "My Printers",
    href: "/printers",
    icon: Printer,
  },
]
