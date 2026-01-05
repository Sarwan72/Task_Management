"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.createTask = exports.getTasks = void 0;
const task_1 = __importDefault(require("../models/task"));
const socket_1 = require("../socket");
const getTasks = async (req, res) => {
    try {
        const tasks = await task_1.default.find({
            $or: [
                { creatorId: req.userId },
                { assignedToId: req.userId },
            ],
        }).sort({ createdAt: -1 });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch tasks" });
    }
};
exports.getTasks = getTasks;
const createTask = async (req, res) => {
    try {
        const { title, description, priority, status, dueDate } = req.body;
        //  VALIDATION
        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Title is required" });
        }
        const task = await task_1.default.create({
            title: title.trim(),
            description: description?.trim() || "",
            priority: priority || "Medium",
            status: status || "To Do",
            dueDate: dueDate || null,
            creatorId: req.userId,
        });
        (0, socket_1.getIO)().emit("task:created", task);
        res.status(201).json(task);
    }
    catch (error) {
        console.error("CREATE TASK ERROR:", error);
        res.status(500).json({ message: "Task creation failed" });
    }
};
exports.createTask = createTask;
// export const updateTask = async (req: AuthRequest, res: Response) => {
//   const { id } = req.params;
//   const task = await Task.findOneAndUpdate(
//     { _id: id, creatorId: req.userId },
//     req.body,
//     { new: true, runValidators: true }
//   );
//   if (!task) {
//     return res.status(404).json({ message: "Task not found" });
//   }
//   res.json(task);
// };
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, priority, status, dueDate } = req.body;
        //  VALIDATION
        if (title !== undefined && !title.trim()) {
            return res.status(400).json({ message: "Title cannot be empty" });
        }
        const task = await task_1.default.findOneAndUpdate({ _id: id, creatorId: req.userId }, {
            ...(title !== undefined && { title: title.trim() }),
            ...(description !== undefined && {
                description: description.trim(),
            }),
            ...(priority && { priority }),
            ...(status && { status }),
            ...(dueDate && { dueDate }),
        }, { new: true, runValidators: true });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        (0, socket_1.getIO)().emit("task:updated", task);
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ message: "Task update failed" });
    }
};
exports.updateTask = updateTask;
// export const deleteTask = async (req: AuthRequest, res: Response) => {
//   try {
//     await Task.findByIdAndDelete(req.params.id);
//     getIO().emit("task:deleted", req.params.id);
//     res.status(204).send();
//   } catch (error) {
//     res.status(500).json({ message: "Task delete failed" });
//   }
// };
const deleteTask = async (req, res) => {
    try {
        const task = await task_1.default.findOneAndDelete({
            _id: req.params.id,
            creatorId: req.userId,
        });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        (0, socket_1.getIO)().emit("task:deleted", req.params.id);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: "Task delete failed" });
    }
};
exports.deleteTask = deleteTask;
