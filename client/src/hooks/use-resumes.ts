import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
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
  const { toast } = useToast();
  const sessionId = getSessionId();

  return useMutation({
    mutationFn: async ({ file, jobDescription }: { file: File, jobDescription?: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sessionId", sessionId);
      if (jobDescription) {
        formData.append("jobDescription", jobDescription);
      }

      const res = await fetch(api.resumes.upload.path, {
        method: "POST",
        body: formData,
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
