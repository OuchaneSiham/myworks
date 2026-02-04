// JWT_KEY="trez1337";
const prisma = require('../config/db.js');
const fp = require("fastify-plugin");
const secret = process.env.JWT_KEY;
// console.log("the secret is ", secret);
module.exports = fp(async function (fastify, opts)
{
    fastify.register(require("@fastify/jwt"),
    {
        secret
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
    fastify.decorate("verifyAdmin", async function (request, reply) 
    {
        const userId = request.user.id;
        try{
            const find = await prisma.user.findUnique({
                where:{
                    id:userId
                }
            })
            if(!find)
                {
                    reply.status(401).send("user not found");
                    return;
            }
            if(find.role !== "admin")
            {
                reply.status(403).send("Access denied. Admins only.");
                return;
            }
        }
    catch(error)
    {
       return reply.status(401).send({error: " ops unauth only admins"}) 
    }
    })
})