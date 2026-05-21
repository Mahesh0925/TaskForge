import Project from '../models/Project.js';
import Task from '../models/Task.js';

export const createProject = async (req, res) => {
  try {
    const { title, description, members, dueDate } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Always include the creator in members so they can see their own project
    const memberList = members ? [...new Set([...members, req.user._id.toString()])] : [req.user._id];

    const newProject = new Project({
      title,
      description,
      createdBy: req.user._id,
      members: memberList,
      dueDate
    });

    await newProject.save();

    // Populate so the response matches getProjects shape
    const populated = await Project.findById(newProject._id)
      .populate('members', 'name email avatar')
      .populate('createdBy', 'name');

    res.status(201).json(populated);
  } catch (error) {
    console.log("Error in createProject controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find().populate('members', 'name email avatar').populate('createdBy', 'name');
    } else {
      projects = await Project.find({ members: req.user._id }).populate('members', 'name email avatar').populate('createdBy', 'name');
    }
    
    // Calculate progress for each project based on tasks
    const projectsWithProgress = await Promise.all(projects.map(async (project) => {
      const tasks = await Task.find({ project: project._id });
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'Completed').length;
      const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
      
      return { ...project._doc, progress, totalTasks, completedTasks };
    }));

    res.status(200).json(projectsWithProgress);
  } catch (error) {
    console.log("Error in getProjects controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email avatar')
      .populate('createdBy', 'name');
      
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Ensure member has access
    if (req.user.role !== 'admin' && !project.members.some(m => m._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Forbidden - You do not have access to this project" });
    }

    res.status(200).json(project);
  } catch (error) {
    console.log("Error in getProjectById controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { title, description, members, status, dueDate } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: "Project not found" });

    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (members) project.members = [...new Set(members)]; // deduplicate
    if (status) project.status = status;
    if (dueDate) project.dueDate = dueDate;

    await project.save();

    // Re-populate so the response matches getProjects shape
    const updated = await Project.findById(project._id)
      .populate('members', 'name email avatar')
      .populate('createdBy', 'name');

    res.status(200).json(updated);
  } catch (error) {
    console.log("Error in updateProject controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    await Task.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProject controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
