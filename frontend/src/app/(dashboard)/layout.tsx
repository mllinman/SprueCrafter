import { type Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - SprueCrafter",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar Placeholder */}
      <aside className="w-full md:w-64 bg-muted/40 border-r p-6 hidden md:block">
        <div className="font-bold text-lg mb-6">SprueCrafter</div>
        <nav className="space-y-4">
          <div className="font-medium">Dashboard</div>
          <div className="text-muted-foreground">Projects</div>
          <div className="text-muted-foreground">Datasets</div>
          <div className="text-muted-foreground">Settings</div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 pt-6">
        {children}
      </main>
    </div>
  )
}
