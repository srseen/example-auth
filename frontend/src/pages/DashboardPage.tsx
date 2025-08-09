import { useEffect, useState } from 'react';
import api from '../api';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const fetchTasks = async () => {
    const res = await api.get<Task[]>('/tasks');
    setTasks(res.data);
  };

  useEffect(() => {
    void fetchTasks();
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/tasks', { title, description });
    setTitle('');
    setDescription('');
    void fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await api.delete(`/tasks/${id}`);
    void fetchTasks();
  };

  const updateStatus = async (id: string, status: Task['status']) => {
    await api.patch(`/tasks/${id}`, { status });
    void fetchTasks();
  };

  const editTask = async (task: Task) => {
    const newTitle = prompt('Title', task.title);
    if (newTitle === null) return;
    const newDescription = prompt('Description', task.description ?? '') ?? '';
    await api.patch(`/tasks/${task.id}`, {
      title: newTitle,
      description: newDescription,
    });
    void fetchTasks();
  };

  return (
    <div>
      <h2>Tasks</h2>
      <form onSubmit={addTask}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <button type="submit">Add Task</button>
      </form>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <strong>{task.title}</strong> - {task.description}
            <select
              value={task.status}
              onChange={(e) =>
                updateStatus(task.id, e.target.value as Task['status'])
              }
            >
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            <button type="button" onClick={() => editTask(task)}>
              Edit
            </button>
            <button type="button" onClick={() => deleteTask(task.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
