import { useEffect, useState, useCallback } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../api/tasks';
import type { Task } from '../api/tasks';

const statusFlow: Task['status'][] = ['TODO', 'IN_PROGRESS', 'DONE'];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    tags: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState({ title: '', dueDate: '' });

  const validateField = (name: string, value: string) => {
    let message = '';
    if (name === 'title' && !value.trim()) message = 'Title is required';
    if (name === 'dueDate' && !value) message = 'Due date is required';
    setFormErrors((prev) => ({ ...prev, [name]: message }));
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    validateField(name, value);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTasks({
        status: statusFilter || undefined,
        sortBy: 'dueDate',
        order: sortOrder,
      });
      setTasks(res.data);
    } catch {
      setError('Could not load tasks');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sortOrder]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formErrors.title || formErrors.dueDate) return;
    const payload = {
      title: form.title,
      description: form.description || undefined,
      dueDate: form.dueDate,
      tags: form.tags
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : undefined,
    };
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingId) {
        await updateTask(editingId, payload);
        setSuccess('Task updated');
      } else {
        await createTask(payload);
        setSuccess('Task added');
      }
      setForm({ title: '', description: '', dueDate: '', tags: '' });
      setEditingId(null);
      load();
    } catch {
      setError(editingId ? 'Failed to update task' : 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task: Task) => {
    setForm({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate.slice(0, 10),
      tags: task.tags?.join(',') || '',
    });
    setEditingId(task.id);
  };

  const advanceStatus = async (task: Task) => {
    const idx = statusFlow.indexOf(task.status);
    if (idx < statusFlow.length - 1) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await updateTask(task.id, { status: statusFlow[idx + 1] });
        setSuccess('Task advanced');
        load();
      } catch {
        setError('Failed to advance task');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this task?')) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await deleteTask(id);
        setSuccess('Task deleted');
        load();
      } catch {
        setError('Failed to delete task');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl mb-4">Tasks</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-2 mb-6">
        <input
          name="title"
          className="border p-2 w-full"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        {formErrors.title && (
          <p className="text-red-600 text-sm">{formErrors.title}</p>
        )}
        <textarea
          name="description"
          className="border p-2 w-full"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <input
          type="date"
          name="dueDate"
          className="border p-2 w-full"
          value={form.dueDate}
          onChange={handleChange}
          required
        />
        {formErrors.dueDate && (
          <p className="text-red-600 text-sm">{formErrors.dueDate}</p>
        )}
        <input
          name="tags"
          className="border p-2 w-full"
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2"
          disabled={loading}
        >
          {loading ? 'Saving...' : editingId ? 'Update' : 'Add'} Task
        </button>
      </form>

      <div className="mb-4 flex items-center gap-2">
        <select
          className="border p-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
        <button
          className="border p-2"
          onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
        >
          Sort by Due Date {sortOrder === 'ASC' ? '↑' : '↓'}
        </button>
      </div>

      {loading && tasks.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Title</th>
                <th className="p-2 border">Due</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Tags</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="border p-2">{task.title}</td>
                  <td className="border p-2">{task.dueDate.slice(0, 10)}</td>
                  <td className="border p-2">{task.status}</td>
                  <td className="border p-2">{task.tags?.join(', ')}</td>
                  <td className="border p-2 space-x-2">
                    <button
                      className="underline"
                      onClick={() => handleEdit(task)}
                    >
                      Edit
                    </button>
                    {task.status !== 'DONE' && (
                      <button
                        className="underline"
                        onClick={() => advanceStatus(task)}
                        disabled={loading}
                      >
                        Advance
                      </button>
                    )}
                    <button
                      className="underline text-red-600"
                      onClick={() => handleDelete(task.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
