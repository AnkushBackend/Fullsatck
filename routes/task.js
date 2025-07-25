const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const verifyToken = require("../middlewares/verifyToken");

// Create Task
router.post("/create", verifyToken, async(req, res) => {
    try {
        const { customerName, alertDate, alertTime, note } = req.body;

        if (!customerName || !alertDate || !alertTime) {
            return res.status(400).json({ error: "All fields are required" });
        }

        let formattedTime = alertTime;
        if (/^\d{2}:\d{2}$/.test(alertTime)) {
            formattedTime = `${alertTime}:00`;
        }

        const task = new Task({
            employeeId: req.user.id,
            customerName,
            alertDate,
            alertTime: formattedTime,
            note,
        });

        const saved = await task.save();

        res.status(201).json({
            message: "Task created successfully",
            data: saved,
        });
    } catch (err) {
        console.error("Error creating task:", err);
        res.status(500).json({ error: "Failed to create task", details: err.message });
    }
});

// Get All Tasks for Logged-in User
router.get("/getAll", verifyToken, async(req, res) => {
    try {
        const tasks = await Task.find({ employeeId: req.user.id }).sort({ alertDate: 1 });
        res.status(200).json({ data: tasks });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});
// Delete Task by ID
router.post("/delete/:id", verifyToken, async(req, res) => {
    try {

        const deletedTask = await Task.findOneAndDelete({
            _id: req.params.id,
            employeeId: req.user.id
        });

        if (!deletedTask) {
            return res.status(404).json({
                error: "Task not found or not authorized"
            });
        }

        res.status(200).json({
            message: "Task deleted successfully",
            data: deletedTask
        });
    } catch (err) {
        res.status(500).json({
            error: "Failed to delete task",
            details: err.message
        });
    }
});

// Edit Task by ID
router.put("/update/:id", verifyToken, async(req, res) => {
    try {
        const { customerName, alertDate, alertTime, note } = req.body;

        const updatedTask = await Task.findOneAndUpdate({
            _id: req.params.id,
            employeeId: req.user.id
        }, {
            customerName,
            alertDate,
            alertTime,
            note
        }, { new: true });

        if (!updatedTask) {
            return res.status(404).json({ error: "Task not found or not authorized" });
        }

        res.status(200).json({
            message: "Task updated successfully",
            data: updatedTask
        });
    } catch (err) {
        console.error("Error updating task:", err);
        res.status(500).json({ error: "Failed to update task", details: err.message });
    }
});

// Get Task by ID
router.get("/getID/:id", verifyToken, async(req, res) => {
    const taskId = req.params.id;

    if (!taskId || taskId === "undefined") {
        return res.status(400).json({ error: "Invalid or missing task ID" });
    }

    try {
        const task = await Task.findOne({
            _id: taskId,
            employeeId: req.user.id,
        });

        if (!task) {
            return res.status(404).json({ error: "Task not found or unauthorized" });
        }

        res.status(200).json({
            message: "Task fetched successfully",
            data: task,
        });
    } catch (err) {
        console.error("Error fetching task:", err);
        res.status(500).json({ error: "Failed to fetch task", details: err.message });
    }
});
// Delete Task by ID


router.post("/delete/:id", verifyToken, async(req, res) => {
    try {
        const taskId = req.params.id;
        const userId = mongoose.Types.ObjectId(req.user.id); // convert to ObjectId

        const deletedTask = await Task.findOneAndDelete({
            _id: taskId,
            employeeId: userId
        });

        if (!deletedTask) {
            return res.status(404).json({
                error: "Task not found or not authorized"
            });
        }

        res.status(200).json({
            message: "Task deleted successfully",
            data: deletedTask
        });
    } catch (err) {
        console.error("Error deleting task:", err);
        res.status(500).json({
            error: "Failed to delete task",
            details: err.message
        });
    }
});


// reminder
router.get("/reminders", verifyToken, async(req, res) => {
    try {
        const now = new Date();
        const fiveSecondsAgo = new Date(now.getTime() - 5 * 1000);

        const tasks = await Task.find({ employeeId: req.user.id });

        const upcomingTasks = tasks.filter(task => {

            const dateStr = new Date(task.alertDate).toISOString().split("T")[0];
            const timeStr = task.alertTime.length === 5 ? `${task.alertTime}:00` : task.alertTime;
            const fullDateTime = new Date(`${dateStr}T${timeStr}`);

            return fullDateTime >= fiveSecondsAgo && fullDateTime <= now;
        });

        res.status(200).json({
            message: "Triggered tasks in last 5 seconds",
            data: upcomingTasks,
        });

    } catch (err) {
        console.error("Error fetching reminders:", err);
        res.status(500).json({
            message: "Internal Server Error: Failed to fetch reminders",
            error: err.message,
        });
    }
});



/*
router.get("/reminders", verifyToken, async(req, res) => {
    try {
        const now = new Date();
        const halfHourAgo = new Date(now.getTime() - 30 * 60 * 1000);

        const tasks = await Task.find({ employeeId: req.user.id });

        const upcomingTasks = tasks.filter(task => {
            const taskDateStr = new Date(task.alertDate).toISOString().split("T")[0];
            const taskDateTime = new Date(`${taskDateStr}T${task.alertTime}`);

            return taskDateTime >= halfHourAgo && taskDateTime <= now;
        });

        res.status(200).json({
            message: "Tasks from last 30 minutes (reminders)",
            data: upcomingTasks,
        });
    } catch (err) {
        console.error("Error fetching reminders:", err);
        res.status(500).json({ error: "Failed to fetch reminders", details: err.message });
    }
});*/


module.exports = router;