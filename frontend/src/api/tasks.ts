import api from './index';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  tags?: string[];
}

export const getTasks = (params?: {
  status?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}) => api.get<Task[]>('/tasks', { params });

export const createTask = (data: {
  title: string;
  description?: string;
  dueDate: string;
  tags?: string[];
}) => api.post<Task>('/tasks', data);

export const updateTask = (
  id: string,
  data: Partial<{
    title: string;
    description?: string;
    dueDate?: string;
    status?: string;
    tags?: string[];
  }>,
) => api.patch<Task>(`/tasks/${id}`, data);

export const deleteTask = (id: string) => api.delete(`/tasks/${id}`);
