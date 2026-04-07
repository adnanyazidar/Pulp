"use client";

import { useTaskStore, Task } from "@/store/task-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Trash2, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DeleteConfirmationModalProps {
  task: Task;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteConfirmationModal({ task, isOpen, onOpenChange }: DeleteConfirmationModalProps) {
  const { deleteTask, tasks } = useTaskStore();

  const handleDelete = async () => {
    try {
      // Find the task before deletion to support undo
      const taskToDelete = tasks.find(t => t.id === task.id);
      
      await deleteTask(task.id);
      onOpenChange(false);

      if (taskToDelete) {
        toast("Task deleted.", {
          description: taskToDelete.content,
          action: {
            label: "Undo",
            onClick: () => {
              useTaskStore.getState().restoreTask(taskToDelete);
            }
          }
        });
      }
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs text-center">
        <DialogHeader className="items-center">
          <div className="w-16 h-16 rounded-3xl bg-pf-primary/10 flex items-center justify-center mb-4 border border-pf-primary/20">
            <Trash2 size={32} className="text-pf-primary" />
          </div>
          <DialogTitle className="text-2xl">Delete Task?</DialogTitle>
          <DialogDescription className="max-w-[200px] mx-auto">
            This action cannot be undone. Are you sure?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <button
            onClick={handleDelete}
            className="w-full bg-pf-primary text-pf-surface py-4 rounded-2xl font-label font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(255,107,107,0.4)] transition-all active:scale-95"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="w-full bg-white/5 text-pf-on-surface-variant/60 py-4 rounded-2xl font-label font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 border border-white/5"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
