"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function Home() {
  const utils = api.useUtils();
  const { data: tasks } = api.task.getTasks.useQuery();

  const createTask = api.task.createTask.useMutation({
    onSuccess: () => utils.task.getTasks.invalidate(),
  });

  const editTask = api.task.editTask.useMutation({
    onSuccess: () => utils.task.getTasks.invalidate(),
  });

  const updateTask = api.task.updateTask.useMutation({
    onSuccess: () => utils.task.getTasks.invalidate(),
  });

  const deleteTask = api.task.deleteTask.useMutation({
    onSuccess: () => utils.task.getTasks.invalidate(),
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!form.title.trim()) return;

    if (editingId) {
      editTask.mutate({
        id: editingId,
        title: form.title,
        description: form.description,
        priority: form.priority as "low" | "medium" | "high",
      });
      setEditingId(null);
    } else {
      createTask.mutate({
        title: form.title,
        description: form.description,
        priority: form.priority as "low" | "medium" | "high",
      });
    }

    setForm({ title: "", description: "", priority: "medium" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-10">
      <h1 className="text-4xl font-bold text-center mb-10 tracking-tight">
         Task Manager
      </h1>

      {/* Form */}
      <div className="flex flex-wrap justify-center gap-4 mb-10">
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="px-4 py-2 rounded-xl border shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
        />

        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="px-4 py-2 rounded-xl border shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
        />

        <select
          value={form.priority}
          onChange={(e) =>
            setForm({ ...form, priority: e.target.value })
          }
          className="px-4 py-2 rounded-xl border shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button
          onClick={handleSubmit}
          className="px-6 py-2 rounded-xl bg-black text-white font-semibold hover:scale-105 active:scale-95 transition-all shadow-lg"
        >
          {editingId ? "Update" : "Add"}
        </button>
      </div>

      {/* Task Cards */}
      <div className="max-w-2xl mx-auto space-y-6">
        {tasks?.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-2xl shadow-lg p-6 flex justify-between items-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div>
              <h2 className="text-xl font-semibold capitalize">
                {task.title}
              </h2>

              <p className="text-gray-500">{task.description}</p>

              <div className="mt-2 flex gap-3 text-sm">
                <span className="px-3 py-1 rounded-full bg-gray-200">
                  Status: {task.status}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-white ${
                    task.priority === "high"
                      ? "bg-red-500"
                      : task.priority === "medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingId(task.id);
                  setForm({
                    title: task.title,
                    description: task.description ?? "",
                    priority: task.priority,
                  });
                }}
                className="px-4 py-2 rounded-xl bg-yellow-400 text-white font-semibold hover:bg-yellow-500 hover:scale-105 transition-all"
              >
                Edit
              </button>

              <button
                onClick={() =>
                  updateTask.mutate({
                    id: task.id,
                    status:
                      task.status === "pending"
                        ? "in-progress"
                        : task.status === "in-progress"
                        ? "completed"
                        : "pending",
                  })
                }
                className="px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 hover:scale-105 transition-all"
              >
                Next
              </button>

              <button
                onClick={() => deleteTask.mutate({ id: task.id })}
                className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 hover:scale-105 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}