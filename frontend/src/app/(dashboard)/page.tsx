export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* KPI Cards Placeholder */}
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="text-sm font-medium">Total Projects</div>
          <div className="text-2xl font-bold">12</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="text-sm font-medium">Storage Used</div>
          <div className="text-2xl font-bold">1.2 GB</div>
        </div>
      </div>
    </div>
  )
}
