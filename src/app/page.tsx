"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { LatestPost } from "./_components/post";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const utils = api.useUtils();

  const {
    data,
    isLoading,
    isError,
    error,
  } = api.task.getTasks.useQuery(undefined, {
    enabled: mounted,
    retry: false,
  });

  const updateTask = api.task.updateTask.useMutation({
    onSuccess: async () => {
      await utils.task.getTasks.invalidate();
    },
  });

  const deleteTask = api.task.deleteTask.useMutation({
    onSuccess: async () => {
      await utils.task.getTasks.invalidate();
    },
  });

  const sendReminder = api.task.sendReminder.useMutation();

  const tasks = data ?? [];

  useEffect(() => {
    if (isError && error?.data?.code === "UNAUTHORIZED") {
      window.location.href = "/login";
    }
  }, [isError, error]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="inline-block w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 text-lg">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (isError && error?.data?.code === "UNAUTHORIZED") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 animate-fade-in">Redirecting to login...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center animate-fade-in">
          <p className="text-red-400 text-lg font-medium">Something went wrong</p>
          <p className="text-slate-500 mt-2 text-sm">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const handleStatusChange = (taskId: string, newStatus: "pending" | "in-progress" | "completed") => {
    updateTask.mutate({ id: taskId, status: newStatus });
  };

  const handleDelete = (taskId: string) => {
    deleteTask.mutate({ id: taskId });
  };

  const handleRemind = (taskId: string) => {
    sendReminder.mutate(
      { id: taskId },
      {
        onSuccess: (result) => {
          const parts = [];
          if (result.email) parts.push("📧 Email");
          if (result.whatsapp) parts.push("💬 WhatsApp");
          if (parts.length > 0) {
            alert(`✅ Reminder sent via ${parts.join(" & ")}!`);
          } else {
            alert("⚠️ No reminders sent. Check your email/phone in profile.");
          }
        },
        onError: (err) => {
          alert(`❌ ${err.message}`);
        },
      }
    );
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "in-progress": return "badge badge-in-progress";
      case "completed": return "badge badge-completed";
      default: return "badge badge-pending";
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "high": return "priority-high";
      case "low": return "priority-low";
      default: return "priority-medium";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return "🔴";
      case "low": return "🟢";
      default: return "🟡";
    }
  };

  const formatDueDate = (dateStr: string | Date | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    const formatted = date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

    if (diffMs < 0) return { text: `Overdue · ${formatted}`, className: "text-red-400" };
    if (diffHrs < 1) return { text: `Due in ${diffMins}m · ${formatted}`, className: "text-orange-400" };
    if (diffHrs < 24) return { text: `Due in ${diffHrs}h · ${formatted}`, className: "text-yellow-400" };
    return { text: `📅 ${formatted}`, className: "text-slate-500" };
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 sm:mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Task Manager
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            ← Logout
          </button>
        </div>

        {/* CREATE TASK */}
        <div className="glass-card p-4 sm:p-6 mb-6 sm:mb-8 animate-slide-up delay-100">
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-400 rounded-full inline-block"></span>
            Create a New Task
          </h2>
          <LatestPost />
        </div>

        {/* TASK LIST */}
        <div className="space-y-3 animate-slide-up delay-200">
          {tasks.length === 0 ? (
            <div className="glass-card p-8 sm:p-10 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-slate-400 text-base sm:text-lg font-medium">No tasks yet</p>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">Create your first task above to get started</p>
            </div>
          ) : (
            tasks.map((task, index) => {
              const dueInfo = formatDueDate(task.dueDate);
              return (
                <div
                  key={task.id}
                  className="glass-card p-4 animate-float-in"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className={`font-semibold text-slate-100 truncate ${task.status === "completed" ? "line-through opacity-60" : ""}`}>
                          {task.title}
                        </h3>
                        <span className={getStatusBadgeClass(task.status)}>
                          {task.status}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-slate-500 text-sm mb-2 truncate">{task.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className={`flex items-center gap-1 ${getPriorityClass(task.priority)}`}>
                          {getPriorityIcon(task.priority)} {task.priority}
                        </span>
                        {dueInfo && (
                          <span className={`flex items-center gap-1 ${dueInfo.className}`}>
                            ⏰ {dueInfo.text}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRemind(task.id)}
                        className="btn-remind"
                        disabled={sendReminder.isPending}
                        title="Send reminder via email & WhatsApp"
                      >
                        {sendReminder.isPending ? "⏳" : "🔔"}
                      </button>

                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as "pending" | "in-progress" | "completed")}
                        className="select-glass text-xs flex-1 sm:flex-none"
                        disabled={updateTask.isPending}
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="in-progress">🔄 In Progress</option>
                        <option value="completed">✅ Completed</option>
                      </select>

                      <button
                        onClick={() => handleDelete(task.id)}
                        className="btn-danger"
                        disabled={deleteTask.isPending}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}