import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ticketSchema,
  type TicketFormData,
} from "@/schemas/ticketSchema";
import {
  type Ticket,
  type TicketRequest,
} from "@/hooks/useTicket";
import { type UserSummary } from "@/hooks/useUsers";

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

interface TicketFormProps {
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

function TicketForm({ isOpen, onClose, onSubmit, ticket, assignees }: TicketFormProps) {
  const isEditMode = !!ticket;

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
      assigneeId: 0,
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
      assigneeId: 0,
      dueDate: new Date(),
    });
  }, [ticket, reset]);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Ticket" : "Create New Ticket"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticket-title">Title</Label>
            <Input id="ticket-title" placeholder="Ticket title" {...register("title")} />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
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
              <p className="text-sm text-red-500">{errors.description.message}</p>
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
              {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
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
              {errors.priority && <p className="text-sm text-red-500">{errors.priority.message}</p>}
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
                  onValueChange={(value) => setValue("assigneeId", Number(value), { shouldValidate: true })}
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
                        <SelectItem key={assignee.id} value={String(assignee.id)}>
                          {assignee.name} ({assignee.role})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.assigneeId && (
              <p className="text-sm text-red-500">{errors.assigneeId.message}</p>
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
            {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Ticket"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TicketForm;
