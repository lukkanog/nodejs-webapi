const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const authConfig = require("../../config/auth.json");
const mailer = require("../../modules/mailer");


const router = express.Router();

// criação de token jwt
const generateToken = function (params = {}) {
    return token = jwt.sign({ params }, authConfig.secret, {
        expiresIn: 86400,
    });
}

//cadastro de usuário
router.post("/register", async (req, res) => {
    try {
        const { email } = req.body;

        //se email ja foi cadastrado
        if (await User.findOne({ email })) {
            return res.status(400).send({ error: "User already exists (this email has already been registered)" });
        }

        const user = await User.create(req.body);

        user.password = undefined;

        res.send({
            user,
            token: generateToken(user.id)
        });

    } catch (error) {
        return res.status(400).send({ error: "User registration failed" });
    }
})

router.post("/login", async (req, res) => {
    try {

        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");

        if (!user)
            return res.status(404).send({ error: "User not found" });

        //verificação de senha
        if (!await bcrypt.compare(password, user.password))
            return res.status(400).send({ error: "Invalid email or password." });

        user.password = undefined;

        // CRIAÇÃO DE TOKEN JWT


        res.send({
            user,
            token: generateToken(user.id)
        });

    } catch (error) {
        return res.status(400).send({ error: error.message });

    }
})


router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user)
            return res.status(404).send({ error: "User not found" });


        const token = crypto.randomBytes(20).toString("hex");

        const now = new Date();
        now.setHours(now.getHours + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                // COLOCAR O $ ANTES DA DATA:
                $passwordResetExpires: now,
            }
        }, {
            new: true,
            useFindAndModify: false
        });


        mailer.sendMail({
            to: email,
            from: "lukkanog@gmail.com",
            template: "forgot-password",
            context: { token }
        }, (error) => {
            if (error)
                return res.status(404).send({ error: "Error on sending \"forgot password\" Email" });

        });


        return res.send("deu bom?");



    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
})


router.post("/reset-password", async (req,res) => {
    try {
        const {email, password, token} = req.body;

        const user = await User.findOne({ email }).select("+passwordResetToken passwordResetExpires");



        if (!user)
            return res.status(404).send({ error: "User not found" });




        if (token !== user.passwordResetToken ){
            console.log("aqui")
            return res.status(400).send({ error: "Invalid token" });
            // return res.status(400).send({ error: "Invalid token" });
        }

        const now = new Date();
        
        if (now > user.passwordResetExpires)
            return res.status(400).send({ error: "Expired token" });


        user.password = password;
        await user.save();

        res.send("senha resetada");



    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
})


module.exports = app => app.use("/users", router)