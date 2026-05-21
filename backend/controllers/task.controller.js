import Task from '../models/Task.js';
import Project from '../models/Project.js';

export const createTask = async (req, res) => {
  try {
    const { title, description, project, assignee, status, priority, dueDate } = req.body;

    if (!title || !project) {
      return res.status(400).json({ message: "Title and project are required" });
    }

    // Verify project exists
    const proj = await Project.findById(project);
    if (!proj) {
      return res.status(404).json({ message: "Project not found" });
    }

    const newTask = new Task({
      title,
      description,
      project,
      assignee,
      status,
      priority,
      dueDate
    });

    await newTask.save();
    
    const populatedTask = await Task.findById(newTask._id).populate('assignee', 'name email avatar');
    res.status(201).json(populatedTask);
  } catch (error) {
    console.log("Error in createTask controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { project } = req.query;
    let query = {};

    if (project) {
      query.project = project;
      
      // Ensure member has access to this project
      if (req.user.role !== 'admin') {
         const proj = await Project.findById(project);
         if (!proj || !proj.members.some(m => m.toString() === req.user._id.toString())) {
             return res.status(403).json({ message: "Forbidden - You do not have access to these tasks" });
         }
      }
    } else if (req.user.role !== 'admin') {
      // Members see all tasks in projects they belong to
      const memberProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = memberProjects.map(p => p._id);
      query.project = { $in: projectIds };
    }

    const tasks = await Task.find(query).populate('assignee', 'name email avatar').populate('project', 'title');
    res.status(200).json(tasks);
  } catch (error) {
    console.log("Error in getTasks controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, description, assignee, status, priority, dueDate } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Members can only update status or add comments (handled elsewhere) of tasks in their projects.
    if (req.user.role !== 'admin') {
       // Check if they are part of the project
       const proj = await Project.findById(task.project);
       if (!proj || !proj.members.some(m => m.toString() === req.user._id.toString())) {
           return res.status(403).json({ message: "Forbidden" });
       }
       // If they are a member, they might only be allowed to update status. For simplicity, we allow full update if they are member of project, or maybe just restrict it if you want.
       // Let's allow members to update task status if they are in the project.
       if (title && title !== task.title) return res.status(403).json({ message: "Forbidden - Members cannot rename tasks" });
    }

    if (title && req.user.role === 'admin') task.title = title;
    if (description !== undefined && req.user.role === 'admin') task.description = description;
    if (assignee && req.user.role === 'admin') task.assignee = assignee;
    if (priority && req.user.role === 'admin') task.priority = priority;
    if (dueDate && req.user.role === 'admin') task.dueDate = dueDate;
    
    // Members can update status
    if (status) task.status = status;

    await task.save();
    const updatedTask = await Task.findById(task._id).populate('assignee', 'name email avatar');
    res.status(200).json(updatedTask);
  } catch (error) {
    console.log("Error in updateTask controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.log("Error in deleteTask controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) return res.status(404).json({ message: "Task not found" });
    
    // Check access
    if (req.user.role !== 'admin') {
       const proj = await Project.findById(task.project);
       if (!proj || !proj.members.some(m => m.toString() === req.user._id.toString())) {
           return res.status(403).json({ message: "Forbidden" });
       }
    }

    task.comments.push({
      user: req.user._id,
      text
    });

    await task.save();
    const updatedTask = await Task.findById(task._id).populate('comments.user', 'name avatar');
    res.status(200).json(updatedTask);
  } catch (error) {
    console.log("Error in addComment controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
