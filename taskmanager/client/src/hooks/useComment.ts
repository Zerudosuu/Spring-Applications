import { useState, useCallback } from "react";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "sonner";

export interface Comment {
    id: number;
    content: string;
    ticketId: number;
    authorId: number;
    authorUsername: string;
    createdAt: string;
}

export interface CommentRequest {
    content: string;
}

const useComment = () => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const getCommentsByTicketId = useCallback(async (ticketId: number) => {
        setIsLoading(true);
        setError("");

        try {
            const response = await axiosInstance.get<Comment[]>(
                `/tickets/${ticketId}/comments`,
            );
            setComments(response.data);
            return response.data;
        } catch (err) {
            setError("Failed to fetch comments. Please try again.");
            toast.error("Failed to load comments.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createComment = useCallback(async (ticketId: number, payload: CommentRequest) => {
        try {
            const response = await axiosInstance.post<Comment>(
                `/tickets/${ticketId}/comments`,
                payload,
            );

            setComments((prev) => [response.data, ...prev]);
            toast.success("Comment added.");
            return response.data;
        } catch (err) {
            toast.error("Failed to add comment.");
            throw err;
        }
    }, []);

    const deleteComment = useCallback(async (commentId: number) => {
        try {
            await axiosInstance.delete(`/comments/${commentId}`);
            setComments((prev) => prev.filter((comment) => comment.id !== commentId));
            toast.success("Comment deleted.");
        } catch (err) {
            toast.error("Failed to delete comment.");
            throw err;
        }
    }, []);

    return {
        comments,
        isLoading,
        error,
        getCommentsByTicketId,
        createComment,
        deleteComment,
    };
};

export default useComment;