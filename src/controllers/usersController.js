const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");


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

router.post("/login", async(req,res) => {
    try {
        
        const { email, password } = req.body;
        const user = await User.findOne( { email }).select("+password");
        
        if (!user)
        return res.status(404).send({ error : "User not found"});
        
        //verificação de senha
        if (!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: "Invalid email or password."});
        
        user.password = undefined;
        res.send({ user });
    
    } catch (error) {
        return res.status(400).send({ error: error});

    }
})

module.exports = app => app.use("/users", router)