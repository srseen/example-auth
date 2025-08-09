import { useEffect, useState } from "react";
import api from "../api";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const fetchTasks = async () => {
    const res = await api.get<Task[]>("/tasks");
    setTasks(res.data);
  };

  useEffect(() => {
    void fetchTasks();
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/tasks", { title, description });
    setTitle("");
    setDescription("");
    void fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await api.delete(`/tasks/${id}`);
    void fetchTasks();
  };

  const updateStatus = async (id: string, status: Task["status"]) => {
    await api.patch(`/tasks/${id}`, { status });
    void fetchTasks();
  };

  const editTask = async (task: Task) => {
    const newTitle = prompt("Title", task.title);
    if (newTitle === null) return;
    const newDescription = prompt("Description", task.description ?? "") ?? "";
    await api.patch(`/tasks/${task.id}`, {
      title: newTitle,
      description: newDescription,
    });
    void fetchTasks();
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        My Tasks
      </h2>

      <form
        onSubmit={addTask}
        className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col md:flex-row gap-4"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Task
        </button>
      </form>

      <ul className="space-y-4">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex-1">
              <strong className="text-xl font-semibold text-gray-900">
                {task.title}
              </strong>
              {task.description && (
                <p className="text-gray-600 mt-1">{task.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3 mt-3 md:mt-0">
              <select
                value={task.status}
                onChange={(e) =>
                  updateStatus(task.id, e.target.value as Task["status"])
                }
                className="p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
              <button
                type="button"
                onClick={() => editTask(task)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
