import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DatasetsTable } from "@/components/datasets/datasets-table"
import { UploadDatasetModal } from "@/components/datasets/upload-modal"

export default function DatasetsPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Datasets</h2>
            <p className="text-muted-foreground">Manage your tabular data sources here.</p>
        </div>
        <UploadDatasetModal>
            <Button>
                <Plus className="mr-2 h-4 w-4" />
                Upload CSV
            </Button>
        </UploadDatasetModal>
      </div>

      <div className="space-y-4">
          <DatasetsTable /> 
      </div>
    </div>
  )
}
