"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Upload, X, FileSpreadsheet } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

const formSchema = z.object({
  file: z.any()
    .refine((files) => files?.length == 1, "File is required.")
    .refine((files) => files?.[0]?.type === "text/csv" || files?.[0]?.name.endsWith(".csv"), "Only CSV files are supported.")
    .refine((files) => files?.[0]?.size <= 50 * 1024 * 1024, "Max file size is 50MB.")
})

export function UploadDatasetModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setUploading(true)
    setProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        return prev + 10
      })
    }, 200)

    try {
      // Mock API call - Replace with real mutation later
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      clearInterval(interval)
      setProgress(100)
      
      toast.success("Dataset uploaded successfully", {
        description: `${selectedFile?.name} has been processed.`,
      })
      
      setTimeout(() => {
        setOpen(false)
        reset()
        setSelectedFile(null)
        setUploading(false)
        setProgress(0)
      }, 500)

    } catch (error) {
       clearInterval(interval)
       setUploading(false)
       toast.error("Upload failed", {
         description: "Please check your connection and try again."
       })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Dataset</DialogTitle>
          <DialogDescription>
            Upload a CSV file to create a new dataset. Max size 50MB.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file">CSV File</Label>
            
            {!selectedFile ? (
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                    <Input 
                        id="file" 
                        type="file" 
                        accept=".csv" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        {...register("file")} 
                        onChange={(e) => {
                            register("file").onChange(e);
                            onFileChange(e);
                        }}
                    />
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Drag & drop or Click to Browse</p>
                    <p className="text-xs text-muted-foreground mt-1">Supports .csv only</p>
                </div>
            ) : (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-green-100 p-2 rounded text-green-600">
                             <FileSpreadsheet className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                            reset();
                            setSelectedFile(null);
                        }}
                        disabled={uploading}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            {errors.file && (
              <p className="text-sm text-destructive">{errors.file.message as string}</p>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload Dataset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
