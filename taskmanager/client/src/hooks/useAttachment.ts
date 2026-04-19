import { useState, useCallback } from "react";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "sonner";

export interface Attachment {
  id: number;
  ticketId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface AttachmentRequest {
  ticketId: number;
  file: File;
}

const useAttachment = () => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const getAttachmentsByTicketId = useCallback(async (ticketId: number) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await axiosInstance.get<Attachment[]>(
        `attachments/ticket/${ticketId}`,
      );
      setAttachments(response.data);
      return response.data;
    } catch (err) {
      setError("Failed to fetch attachments. Please try again.");
      toast.error("Failed to load attachments.");
      throw err;
    }
  }, []);

  const uploadAttachment = useCallback(async (payload: AttachmentRequest) => {
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", payload.file);
      formData.append("ticketId", payload.ticketId.toString());

      const response = await axiosInstance.post<Attachment>(
        "/attachments", // ✅ FIXED
        formData,
      );

      setAttachments((prev) => [response.data, ...prev]);
      toast.success("Attachment uploaded successfully");
      return response.data;
    } catch (err) {
      setError("Failed to upload attachment.");
      toast.error("Upload failed.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    error,
    isLoading,
    attachments,
    getAttachmentsByTicketId,
    uploadAttachment,
  };
};

export default useAttachment;
