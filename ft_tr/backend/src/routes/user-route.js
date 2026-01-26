const userController =  require("../controllers/user-controller.js");
async function routes(fastify, options) {
    fastify.get("/register", userController.registration);
}
module.exports = routes;