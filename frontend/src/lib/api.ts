import axios from "axios"

// Create axios instance with default config
export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // TODO: Integrate with real Auth provider (Clerk/NextAuth)
    // For now, we'll check localStorage for a development token
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export interface ProcessingResponse {
    message?: string;
    output_path?: string;
    // Add other fields as needed
}

// ... types
export interface Dataset {
  id: number;
  user_id: number;
  filename: string;
  original_filename: string;
  file_type: string;
  storage_path: string;
  file_size: number;
  row_count: number | null;
  columns: any; // JSON
  status: string;
  created_at: string;
  updated_at: string;
}

export const datasetsApi = {
// ...
  getDatasets: async () => {
    const response = await api.get<Dataset[]>('/datasets')
    return response.data
  },
  uploadDataset: async (file: File, onUploadProgress?: (progressEvent: any) => void) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<Dataset>('/datasets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    })
    return response.data
  },
  deleteDataset: async (id: number) => {
    await api.delete(`/datasets/${id}`)
  },
}

export const processingApi = {
    // 1. Convert
    convert: async (file: File, format: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('format', format);
        const response = await api.post('/convert', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            responseType: 'blob'
        });
        return response.data; // Blob
    },

    // 2. Scale
    scale: async (file: File, scale: number, unit: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('scale', scale.toString());
        formData.append('unit', unit);
        const response = await api.post('/scale', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            responseType: 'blob'
        });
        return response.data;
    },

    // 3. Separate
    separate: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/separate', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data; // JSON info about parts
    },

    // 4. Transform
    transform: async (file: File, operation: 'rotate' | 'translate' | 'scale', params: any) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('operation', operation);
        Object.keys(params).forEach(key => formData.append(key, params[key]));
        
        const response = await api.post('/transform', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            responseType: 'blob'
        });
        return response.data;
    },

    // 5. Supports
    generateSupports: async (file: File, mode: 'automatic' | 'estimate', params: any) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('mode', mode);
        Object.keys(params).forEach(key => formData.append(key, params[key]));

        const response = await api.post('/generate-supports', formData, {
             headers: { 'Content-Type': 'multipart/form-data' },
             responseType: mode === 'estimate' ? 'json' : 'blob'
        });
        return response.data;
    },

    // 6. Sprue
    generateSprue: async (file: File, params: {
        build_plate_x: number;
        build_plate_y: number;
        build_plate_z: number;
        connector_type: string;
    }) => {
         const formData = new FormData();
         formData.append('file', file);
         Object.keys(params).forEach(key => formData.append(key, (params as any)[key]));

         const response = await api.post('/generate-sprue', formData, {
             headers: { 'Content-Type': 'multipart/form-data' },
             responseType: 'blob'
         });
         return response.data;
    },
    
    // 7. Photo to Model
// ...
    photoToModel: async (files: File[]) => {
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        
         const response = await api.post('/photo-to-model', formData, {
             headers: { 'Content-Type': 'multipart/form-data' },
             responseType: 'blob'
         });
         return response.data;
    }
}

export const billingApi = {
    createCheckoutSession: async (priceId?: string) => {
        const response = await api.post<{ checkoutUrl: string }>('/billing/create-checkout-session', { price_id: priceId });
        return response.data;
    },
    createPortalSession: async () => {
        const response = await api.post<{ portalUrl: string }>('/billing/create-portal-session');
        return response.data;
    }
}

export default api
