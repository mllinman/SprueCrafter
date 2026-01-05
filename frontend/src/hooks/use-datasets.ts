import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { toast } from "sonner"

export type Dataset = {
  id: number
  filename: string
  original_filename: string
  row_count: number
  file_size: number
  created_at: string
}

export const useDatasets = () => {
  return useQuery({
    queryKey: ["datasets"],
    queryFn: async () => {
      const { data } = await api.get<Dataset[]>("/datasets")
      return data
    },
  })
}

export const useUploadDataset = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      
      const { data } = await api.post<Dataset>("/datasets", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasets"] })
      toast.success("Dataset uploaded successfully")
    },
    onError: (error: any) => {
      console.error(error)
      toast.error("Upload failed", {
        description: error.response?.data?.error || "Something went wrong"
      })
    },
  })
}

export const useDeleteDataset = () => {
    const queryClient = useQueryClient()
  
    return useMutation({
      mutationFn: async (id: number) => {
        await api.delete(`/datasets/${id}`)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["datasets"] })
        toast.success("Dataset deleted")
      },
      onError: (error: any) => {
        toast.error("Deletion failed", {
            description: error.response?.data?.error || "Could not delete dataset"
        })
      },
    })
  }
