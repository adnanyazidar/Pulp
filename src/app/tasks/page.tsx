import { ListTodo } from "lucide-react";
import { BottomNavbar } from "@/components/layout/bottom-navbar";

export default function TasksPage() {
  return (
    <div className="p-6 md:p-12 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center">
      <ListTodo className="w-16 h-16 text-pf-primary mb-6 opacity-20" />
      <h2 className="text-3xl font-headline font-extrabold text-pf-on-surface mb-2 tracking-tight">
        Tasks
      </h2>
      <p className="text-pf-on-surface-variant/60 font-label uppercase tracking-[0.2em] text-[10px]">
        Task Management Module Coming Soon
      </p>
      
      <BottomNavbar />
    </div>
  );
}
