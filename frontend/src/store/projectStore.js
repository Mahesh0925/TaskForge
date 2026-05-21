import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/projects");
      set({ projects: res.data });
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to fetch projects" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProjectById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get(`/projects/${id}`);
      set({ currentProject: res.data });
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to fetch project" });
    } finally {
      set({ isLoading: false });
    }
  },

  createProject: async (data) => {
    try {
      const res = await axiosInstance.post("/projects", data);
      set({ projects: [...get().projects, res.data] });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to create project" };
    }
  },

  updateProject: async (id, data) => {
    try {
      const res = await axiosInstance.put(`/projects/${id}`, data);
      // Replace the project in the list with the fully-populated response
      set({
        projects: get().projects.map(p => p._id === id ? res.data : p),
        currentProject: get().currentProject?._id === id ? res.data : get().currentProject
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to update project" };
    }
  },

  deleteProject: async (id) => {
    try {
      await axiosInstance.delete(`/projects/${id}`);
      set({ projects: get().projects.filter(p => p._id !== id) });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to delete project" };
    }
  }
}));
