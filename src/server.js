const express = require('express');
const app = express();


app.listen(3000, () => {
    console.log("Listening to 3000");
})

app.use(express.json())

// Controller de usuários
require("./controllers/usersController")(app);
