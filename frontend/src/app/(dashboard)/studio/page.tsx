import { Card } from "@/components/ui/card"
import SlicerScene from "@/components/studio/slicer-scene"

export default function StudioPage() {
  // TODO: Fetch active printer volume from global state or API
  const activeVolume = { x: 256, y: 256, z: 256 }

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] flex flex-col space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Studio</h2>
            <p className="text-muted-foreground">Preview, slice, and prepare your models.</p>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 pb-4">
          <div className="lg:col-span-3 h-full min-h-[500px]">
              <SlicerScene volume={activeVolume} />
          </div>
          
          <div className="space-y-4 h-full">
              <Card className="h-full p-4">
                  <h3 className="font-semibold mb-4">Object List</h3>
                  <div className="text-sm text-muted-foreground">
                      <p>No objects loaded.</p>
                  </div>
              </Card>
          </div>
      </div>
    </div>
  )
}
