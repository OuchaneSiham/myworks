
// const fastify = require('fastify')({ logger: true });
// JWT_KEY="trez1337"
// fastify.register(require('@fastify/jwt'), {
//     secret: JWT_KEY,
//   })

const bcrypt = require ('bcrypt');
const path = require('path');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client();
const userController = require("../controllers/user-controller.js");
const v = require ("validator");
const { create } = require('domain');
GOOGLE_CLIENT_ID="470373993744-tjq6l6bk7ikvbvl46vpbd12pcqepuctb.apps.googleusercontent.com"
// const { PrismaClient }  = require('../generated/prisma/client');
// const { PrismaClient } = require('../generated/prisma/client.js');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require('pg');
const fs = require('fs');
// const util = require('util');
const { pipeline } = require('stream/promises');
// Use the environment variable from Docker
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function routes(fastify, options) {
    fastify.get("/find",{ preHandler: [fastify.jwtAuthFun] }, async function (request, reply) 
    {
        try{
            const by = await prisma.user.findMany();
            //u an also use it for email cz its unique nt the name uts nin unque
            // reply.send("hello");
            reply.send(by);
        }
        catch(err)
        {
            reply.status(500).send(err);
        }
        // reply.send({auth2client});
    })
    fastify.post("/register", async (request, reply) => {
        const { username, email, password } = request.body;
        // console.log("siham-----------------");
        // console.log('Received:', { username, email , password});
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
            // console.log("+++++++++++++", );
                        // console.log("+++++++++++++", myhash);
            const token = fastify.jwt.sign({
                            id: user.id,
                            email: user.email
                        }, {expiresIn: "24h"})
            // console.log("this is the token", user.id, user.email);
            console.log("this is the token", token);
            reply.status(201).send({
                    success: true,
                    message: "User created successfulely!",
                    user,
                    token
            }
            // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQsImVtYWlsIjoic2loZGRkZEBleGFtcGxlLmNvbSIsImlhdCI6MTc2ODg0MzgwOCwiZXhwIjoxNzY4OTMwMjA4fQ.zrZ0Zmdm7MaJiHpqzEmWqfQQBqqASAIRmoGsPdAj8kU
        );
        } 
        catch (error) {
            // console.error("Error creating user:", error.message, error.meta);
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
                    // password: password
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
            reply.status(200).send({
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
            // console.log("a7aaa", payload_sig);
            const payloadn = payload_sig.payload.name;
            const payloade = payload_sig.payload.email;
            const payloadsub = payload_sig.payload.sub;

            // console.log(payloadn, payloade, payloadsub);
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
            const token = fastify.jwt.sign({
                email: user.email,
                id : user.id
            } , {expiresIn: "24h"} );

            reply.send({
                message: "u logged in su",
                token
            });
        }
        catch(error)
        {
            reply.status(500).send("login unsuccessfuly!");
        }
    })

    fastify.get("/me", {preHandler :[fastify.jwtAuthFun]}, async function (request, reply){
        // console.log("user request", request.user.id);
        try{
            const record = await prisma.user.findUnique({
                where:{
                    id: request.user.id,
                },
                select:{
                    id: true,
                    username: true,
                    email: true,
                    avatar: true
                }
            })
            // console.log("the full record is :", record);
            reply.status(200).send(record);
        }
        catch(err){

        }
    })

    fastify.patch("/update", {preHandler :[fastify.jwtAuthFun]}, async function (request, reply){
        // console.log("update user by his id", request.user.id);
        // console.log("update user by his id", request.body);
        console.log("Headers:", request.headers['content-type']);
        // const is = request.headers['content-type'];
        if(request.isMultipart())
            {
                console.log("✅ DETECTED! About to parse file...");
                try {
                    const data = await request.file(); 
                    console.log("File parsed! Name is:", data?.filename);
                    const newFile = Date.now() + '-' + data.filename;
                    const savePath = path.join(__dirname, '..', '..', 'uploads', newFile);
                    console.log("1. Starting the Pipe...");
                    const result = await pipeline(data.file, fs.createWriteStream(savePath));
                    console.log("2. Pipe Finished! Result:", result);
                    return reply.send({ message: "File saved successfully!" });
                    // ... the rest of your pipeline code
                } catch (e) {
                    console.log("Parsing failed:", e.message);
                }
            }
            else{
                console.log("✅ NO FILE DETECTED!");
            }
            if(request.body)
            {
                    const {username, email} = request.body;
                    try{
                        if(username)
                        {
                            const  updu = await prisma.user.findUnique({
                                where:{username:username}
                            });
                                if( updu && updu.id != request.user.id)
                                    {reply.status(400).send("Username already taken")
                                return;}
                        } 
                        if(email)
                            {
                                const  upde = await prisma.user.findUnique({
                                    where:{email:email}
                                });
                                    if(upde && upde.id != request.user.id)
                                        {reply.status(400).send("email already taken");
                                     return;
                                }
                            }
                            const newuser = await prisma.user.update({
                                where:{id: request.user.id},
                                data:request.body
                            })
                            reply.status(200).send({
                                newuser
                            });
            }
            catch(err){
                reply.status(500).send("cant update data");
            }
        }
    })
}

module.exports = routes;

// @fastify/multipart: This is the "hands" that can open the FormData and extract the image.

// @fastify/static: This is the "display window." Once you save the image, you need a way for the browser to see it (e.g., http://localhost:8281/uploads/photo.jpg).