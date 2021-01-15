const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const authConfig = require("../config/auth.json")


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

        res.send({ 
            user, 
            token : generateToken(user.id) 
        });

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

        // CRIAÇÃO DE TOKEN JWT
        

        res.send({ 
            user, 
            token : generateToken(user.id) 
        });
    
    } catch (error) {
        return res.status(400).send({ error: error.message});

    }
})

const generateToken = function(params = {}){
    return token = jwt.sign({ params }, authConfig.secret, {
        expiresIn : 86400,
    })
}

module.exports = app => app.use("/users", router)