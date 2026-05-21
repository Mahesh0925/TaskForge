import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async (projectId = null) => {
    set({ isLoading: true, error: null });
    try {
      const url = projectId ? `/tasks?project=${projectId}` : "/tasks";
      const res = await axiosInstance.get(url);
      set({ tasks: res.data });
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to fetch tasks" });
    } finally {
      set({ isLoading: false });
    }
  },

  createTask: async (data) => {
    try {
      const res = await axiosInstance.post("/tasks", data);
      set({ tasks: [...get().tasks, res.data] });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to create task" };
    }
  },

  updateTask: async (id, data) => {
    try {
      const res = await axiosInstance.put(`/tasks/${id}`, data);
      set({ tasks: get().tasks.map(t => t._id === id ? res.data : t) });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to update task" };
    }
  },

  deleteTask: async (id) => {
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      set({ tasks: get().tasks.filter(t => t._id !== id) });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to delete task" };
    }
  },

  addComment: async (id, text) => {
    try {
      const res = await axiosInstance.post(`/tasks/${id}/comments`, { text });
      set({ tasks: get().tasks.map(t => t._id === id ? res.data : t) });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to add comment" };
    }
  }
}));
