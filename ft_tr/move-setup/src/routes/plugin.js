JWT_KEY="trez1337";
const fp = require("fastify-plugin");
module.exports = fp(async function (fastify, opts)
{
    fastify.register(require("@fastify/jwt"),
    {
        secret: JWT_KEY
    })
    fastify.decorate("jwtAuthFun", async function (request, reply) 
    {
    try{
        await request.jwtVerify();
    }
    catch(error)
    {
       return reply.status(401).send({error: " ops unauth"}) 
    }
})
})