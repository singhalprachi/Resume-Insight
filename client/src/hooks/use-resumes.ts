import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Resume } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Helper to get/set session ID
const getSessionId = () => {
  let id = localStorage.getItem("resume_analyzer_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("resume_analyzer_session_id", id);
  }
  return id;
};

export function useResumes() {
  const sessionId = getSessionId();
  
  return useQuery({
    queryKey: [api.resumes.list.path, sessionId],
    queryFn: async () => {
      // In a real app we'd filter by session on backend, 
      // but for now we fetch list and filter or pass session as query param if API supported it.
      // Assuming the API returns all for now or we just fetch the endpoint.
      // If the backend doesn't support filtering by session ID yet, we might get everything,
      // but let's assume standard behavior.
      const res = await fetch(api.resumes.list.path);
      if (!res.ok) throw new Error("Failed to fetch resumes");
      
      const data = await res.json();
      const parsed = api.resumes.list.responses[200].parse(data);
      
      // Client-side filtering if backend returns all (typical for simple demos)
      return parsed.filter(r => r.sessionId === sessionId);
    },
  });
}

export function useResume(id: number | null) {
  return useQuery({
    queryKey: [api.resumes.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.resumes.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch resume");
      return api.resumes.get.responses[200].parse(await res.json());
    },
  });
}

export function useUploadResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const sessionId = getSessionId();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sessionId", sessionId);

      const res = await fetch(api.resumes.upload.path, {
        method: "POST",
        body: formData, // Browser sets Content-Type to multipart/form-data automatically
      });

      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || "Upload failed");
        } catch (e) {
          throw new Error("Failed to upload resume");
        }
      }

      return api.resumes.upload.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] });
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${data.filename}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });
}
