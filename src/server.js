const express = require('express');
const controllers = require('./app/controllers');
const app = express();




app.use(express.json())

// Controller de usuários
// require("./controllers/usersController")(app);
// require("./controllers/projectsController")(app);


// todos os controllers
require("./app/controllers/index")(app);

app.listen(3000, () => {
    console.log("Listening to 3000");
})