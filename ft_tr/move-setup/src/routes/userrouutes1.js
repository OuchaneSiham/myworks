
const bcrypt = require ('bcrypt');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client();
const userController = require("../controllers/user-controller.js");
const v = require ("validator");
const { create } = require('domain');
GOOGLE_CLIENT_ID="470373993744-tjq6l6bk7ikvbvl46vpbd12pcqepuctb.apps.googleusercontent.com"
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
async function routes(fastify, options) {
    fastify.get("/find", async function (request, reply) 
    {
        try{
            const by = await prisma.user.findMany();
            reply.send(by);
        }
        catch(err)
        {
            reply.status(500).send(err);
        }
    })
    fastify.post("/register", async (request, reply) => {
        const { username, email, password } = request.body;
        if(!username || !email || !password)
        {
            reply.status(500).send("all the three fields are required");
        }
        if(!v.isStrongPassword(password))
        {
            reply.status(500).send("Password too weak: it must be at least 8 characters, include an uppercase letter, a number, and a symbol.");
            return ;
        }
        if(!v.matches(username, /^[A-Za-z0-9_]+$/))
        {
            reply.status(400).send("Username can only have letters, numbers, and underscores.");
            return ;
        }
        if(!v.isEmail(email))
        {
            reply.status(500).send("follow the email format");
            return ;
        }
        try {
            const mysalt =  await bcrypt.genSalt(10);
            const myhash =  await bcrypt.hash(password, mysalt);
            const user = await prisma.user.create({data: {username, email, password: myhash}});
            const token = fastify.jwt.sign({
                            id: user.id,
                            email: user.email
                        }, {expiresIn: "24h"})
            reply.status(201).send({
                    success: true,
                    message: "User created successfulely!",
                    user,
                    token
            }
        );
        } 
        catch (error) {
            if(error.code == "P2002")
            {
                reply.status(500).send({
                error: "the username or email already taken try again"
            });
            }
            reply.status(500).send("failed to register the user");
        }
    });
    fastify.post("/login", async function (request, reply) 
    {
        const {username, password} = request.body
        try{
            const exist = await prisma.user.findUnique({
                where:{
                    username: username,
                }
            })
            if(exist == null)
            {
                reply.status(500).send(
                    "this user doesnt exist in our db! if u didint register yet go to register page or username inccorect!");
            }
            console.log("sihammmm", exist);
            const result = await bcrypt.compare(password, exist.password);
            if(result == false)
                reply.status(500).send({error: "wrong password try again!"});

                const token = fastify.jwt.sign({
                    id: exist.id,
                    email: exist.email
                }, {expiresIn: "24h"})
                console.log("the token is again", token);
            reply.status(200).send("login s",{
                username: exist.username,
                email: exist.email,
                token
            });
        }
        catch(error)
        {
            reply.status(500).send("login unsuccessfuly!");
        }
    })
    fastify.post("/google-auth", async function (request, reply) 
    {
        const {token } = request.body;
        console.log("token is:", token);
        try{
            const payload_sig = await client.verifyIdToken({
                idToken: token,
                audience: GOOGLE_CLIENT_ID,
            })
            const payloadn = payload_sig.payload.name;
            const payloade = payload_sig.payload.email;
            const payloadsub = payload_sig.payload.sub;
            const user = await prisma.user.upsert({
                where:{
                    email:payloade
                },
                update:{
                    email:payloade,
                    username:payloadn,
                    googleId: payloadsub,
                },
                create:{
                    email:payloade,
                    username:payloadn,
                    googleId: payloadsub,
                }
            })
            reply.send({
                message: "u logged in su"
            });
        }
        catch(error)
        {

        }
    })

}

module.exports = routes;