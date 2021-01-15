const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");

// router.use(authMiddleware);

router.get("/",authMiddleware, async(req, res) => {
    try {
        return res.send({ok: "k"})
    } catch (error) {
        return res.status(400).send({ error : error.message })
    }
})

module.exports = app => app.use("/projects", router)