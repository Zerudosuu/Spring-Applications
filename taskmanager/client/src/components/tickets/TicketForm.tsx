import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ticketSchema, type TicketFormData } from "@/schemas/ticketSchema";
import { type Ticket, type TicketRequest } from "@/hooks/useTicket";
import useComment from "@/hooks/useComment";
import { type UserSummary } from "@/hooks/useUsers";
import useAuthStore from "@/store/authStore";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAttachment from "@/hooks/useAttachment";

interface TicketFormProps {
  ticketId?: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TicketRequest) => Promise<void>;
  ticket?: Ticket | null;
  assignees: UserSummary[];
}

function formatToDateOnly(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function TicketForm({
  isOpen,
  onClose,
  onSubmit,
  ticket,
  assignees,
}: TicketFormProps) {
  const isEditMode = !!ticket;
  const { user } = useAuthStore();
  const {
    comments,
    isLoading: isCommentsLoading,
    error: commentsError,
    getCommentsByTicketId,
    createComment,
    deleteComment,
  } = useComment();

  const { attachments, getAttachmentsByTicketId, uploadAttachment } =
    useAttachment();

  //this is for attachments
  const [isAttachmentUploading, setIsAttachmentUploading] = useState(false);
  const [attachmentError, setAttachmentError] = useState(""); // For upload errors

  useEffect(() => {
    if (!isOpen || !ticket?.id) return;

    setAttachmentError("");
    void getAttachmentsByTicketId(ticket.id);
  }, [isOpen, ticket?.id, getAttachmentsByTicketId]);

  const getFileCategory = (fileType: string) => {
    if (fileType.startsWith("image/")) return "image";
    if (fileType === "application/pdf") return "pdf";
    return "other";
  };

  //this is for comment
  const [newComment, setNewComment] = useState("");
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "TASK",
      priority: "MEDIUM",
      assigneeId: assignees.length > 0 ? 0 : undefined,
      dueDate: new Date(),
    },
  });

  useEffect(() => {
    if (ticket) {
      reset({
        title: ticket.title,
        description: ticket.description || "",
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        assigneeId: ticket.assigneeId,
        dueDate: new Date(ticket.dueDate),
      });
      return;
    }

    reset({
      title: "",
      description: "",
      category: "TASK",
      priority: "MEDIUM",
      assigneeId: assignees.length > 0 ? 0 : undefined,
      dueDate: new Date(),
    });
  }, [ticket, reset]);

  //this is for comment
  useEffect(() => {
    if (!isOpen || !ticket?.id) return;

    void getCommentsByTicketId(ticket.id);
  }, [isOpen, ticket?.id, getCommentsByTicketId]);

  const isCommentDisabled = useMemo(
    () => !newComment.trim() || newComment.trim().length > 1000,
    [newComment],
  );

  const handleFormSubmit = async (data: TicketFormData) => {
    const payload: TicketRequest = {
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: data.status,
      assigneeId: data.assigneeId,
      dueDate: formatToDateOnly(data.dueDate),
    };

    await onSubmit(payload);
    onClose();
  };

  const handleAddComment = async () => {
    if (!ticket?.id || isCommentDisabled) return;

    setIsCommentSubmitting(true);
    try {
      await createComment(ticket.id, { content: newComment.trim() });
      setNewComment("");
      await getCommentsByTicketId(ticket.id);
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    setDeletingCommentId(commentId);
    try {
      await deleteComment(commentId);
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Ticket" : "Create New Ticket"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticket-title">Title</Label>
            <Input
              id="ticket-title"
              placeholder="Ticket title"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-description">Description</Label>
            <Textarea
              id="ticket-description"
              placeholder="Describe the issue"
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUG">Bug</SelectItem>
                      <SelectItem value="FEATURE">Feature</SelectItem>
                      <SelectItem value="TASK">Task</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.priority && (
                <p className="text-sm text-red-500">
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assignee</Label>
            <Controller
              name="assigneeId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value > 0 ? String(field.value) : ""}
                  onValueChange={(value) =>
                    setValue("assigneeId", Number(value), {
                      shouldValidate: true,
                    })
                  }
                  disabled={assignees.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignees.length === 0 ? (
                      <SelectItem value="NO_ASSIGNABLE_USERS" disabled>
                        No assignable users available
                      </SelectItem>
                    ) : (
                      assignees.map((assignee) => (
                        <SelectItem
                          key={assignee.id}
                          value={String(assignee.id)}
                        >
                          {assignee.name} ({assignee.role})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.assigneeId && (
              <p className="text-sm text-red-500">
                {errors.assigneeId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-due-date">Due Date</Label>
            <Input
              id="ticket-due-date"
              type="date"
              {...register("dueDate", {
                setValueAs: (value) => (value ? new Date(value) : undefined),
              })}
            />
            {errors.dueDate && (
              <p className="text-sm text-red-500">{errors.dueDate.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Ticket"}
            </Button>
          </div>
        </form>

        {isEditMode && ticket?.id && (
          <div className="border-t pt-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="ticket-attachments">Attachments</Label>
              <input
                id="ticket-attachments"
                type="file"
                title="Upload attachment"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setIsAttachmentUploading(true);
                    try {
                      await uploadAttachment({
                        ticketId: ticket?.id,
                        file,
                      });
                      await getAttachmentsByTicketId(ticket?.id);
                    } catch (error) {
                      console.error("Attachment upload failed:", error);
                      setAttachmentError("Failed to upload attachment");
                    } finally {
                      setIsAttachmentUploading(false);
                    }
                  }
                }}
              />
              {isAttachmentUploading && (
                <p className="text-sm text-gray-500">Uploading...</p>
              )}
              {attachmentError && (
                <p className="text-sm text-red-500">{attachmentError}</p>
              )}

              <ul className="space-y-2">
                {attachments.map((attachment) => {
                  const type = getFileCategory(attachment.fileType);

                  return (
                    <li
                      key={attachment.id}
                      className="flex items-center gap-3 border p-2 rounded"
                    >
                      {type === "image" ? (
                        <img
                          src={attachment.fileUrl}
                          alt={attachment.fileName}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : type === "pdf" ? (
                        <span className="text-red-500 text-xl">📄</span>
                      ) : (
                        <span className="text-gray-500 text-xl">📎</span>
                      )}

                      <a
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate"
                      >
                        {attachment.fileName}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Comments</h3>
              <span className="text-xs text-gray-500">
                {comments.length} total
              </span>
            </div>

            <div className="space-y-2">
              <Textarea
                id="ticket-comment"
                placeholder="Write a comment"
                rows={3}
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                maxLength={1000}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {newComment.length}/1000
                </p>
                <Button
                  type="button"
                  onClick={handleAddComment}
                  disabled={isCommentSubmitting || isCommentDisabled}
                >
                  {isCommentSubmitting ? "Adding..." : "Add Comment"}
                </Button>
              </div>
            </div>

            {commentsError && (
              <p className="text-sm text-red-500">{commentsError}</p>
            )}

            {isCommentsLoading ? (
              <p className="text-sm text-gray-500">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-gray-500">No comments yet.</p>
            ) : (
              <div className="space-y-2">
                {comments.map((comment) => {
                  const canDelete =
                    user?.id === comment.authorId ||
                    user?.role === "ADMIN" ||
                    user?.role === "TRIAGE";

                  return (
                    <div
                      key={comment.id}
                      className="rounded border p-3 space-y-2"
                      id="ticket-comments"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-700 truncate">
                            {comment.authorUsername}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>

                        {canDelete && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deletingCommentId === comment.id}
                          >
                            {deletingCommentId === comment.id
                              ? "Deleting..."
                              : "Delete"}
                          </Button>
                        )}
                      </div>

                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TicketForm;
