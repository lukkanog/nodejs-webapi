const express = require("express");
const authMiddleware = require("../middlewares/auth");

const Project = require("../models/Project");
const Task = require("../models/Task");

const router = express.Router();
router.use(authMiddleware);

//para usar middleware de autenticação apenas em endpoints especificos, tomar como exemplo:
// router.get("/",authMiddleware, async(req, res) => {}


router.get("/", async (req, res) => {
    try {
        const projects = await Project.find().populate(["user", "tasks"]);

        return res.send({ projects });
    } catch (error) {
        return res.status(400).send({ error: error.message })
    }
})

router.get("/:id", async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate(["user", "tasks"]);

        if (!project)
            return res.status(404).send({ error: "Project not found" });

        return res.send({ project });

    } catch (error) {
        return res.status(400).send({ error: error.message })
    }
})

router.post("/", async (req, res) => {
    try {
        const { title, description, tasks } = req.body;


        const project = await Project.create({ title, description, user: req.userId });

        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id });

            await projectTask.save();

            project.tasks.push(projectTask);


        }));

        await project.save();

        return res.send({ project });

    } catch (error) {
        return res.status(400).send({ error: error.message })
    }
})

router.put("/:id", async (req, res) => {
    try {
        const { title, description, tasks } = req.body;


        const project = await Project.findByIdAndUpdate(req.params.id, {
            title,
            description, 
        }, {new : true});

        project.tasks = [];
        await Task.remove({project: project._id})

        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id });

            await projectTask.save();

            project.tasks.push(projectTask);

        }));

        await project.save();

        return res.send({ project });

    } catch (error) {
        return res.status(400).send({ error: error.message })
    }
})

router.delete("/:id", async (req, res) => {
    try {
        await Project.findByIdAndRemove(req.params.id).populate("user");

        return res.send({ message: "Project deleted." });

    } catch (error) {
        return res.status(400).send({ error: error.message })
    }
})

module.exports = app => app.use("/projects", router)