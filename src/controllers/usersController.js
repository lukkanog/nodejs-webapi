const express = require("express");
const User = require("../models/User");

const router = express.Router();

//cadastro de usuário
router.post("/register", async(req, res) => {
    try {
        const { email } = req.body;

        //se email ja foi cadastrado
        if (await User.findOne({ email })){
            return res.status(400).send({ error: "User already exists (this email has already been registered)" });
        }

        const user = await User.create(req.body);

        user.password = undefined;

        return res.send({ user })

    } catch (error) {
        return res.status(400).send({ error: "User registration failed" });
    }
})

module.exports = app => app.use("/users", router)