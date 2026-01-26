const userRoutes = require("../routes/user-route");
async function registration(request, reply) {
    try{
        const message = "hello from the register endpoint";
        reply.send(message);
        console.log("siham");
    }
    catch(error)
    {
        reply.status(500).send(error);
    }
}
module.exports = {registration};