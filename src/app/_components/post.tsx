"use client";

import { useState } from "react";
import { api } from "../../trpc/react";

export function LatestPost() {
  const utils = api.useUtils();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const createTask = api.task.createTask.useMutation({
    onSuccess: async () => {
      await utils.task.getTasks.invalidate();
      setTitle("");
      setDescription("");
      setPriority("medium");
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        createTask.mutate({
          title,
          description: description || undefined,
          priority,
        });
      }}
      className="flex flex-col gap-3"
    >
      <input
        type="text"
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input-glass"
      />

      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="input-glass"
      />

      <div className="flex gap-3">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
          className="select-glass flex-1"
        >
          <option value="low">🟢 Low Priority</option>
          <option value="medium">🟡 Medium Priority</option>
          <option value="high">🔴 High Priority</option>
        </select>

        <button
          type="submit"
          className="btn-primary"
          disabled={createTask.isPending || !title.trim()}
        >
          {createTask.isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
              Adding...
            </span>
          ) : (
            "＋ Add Task"
          )}
        </button>
      </div>
    </form>
  );
}