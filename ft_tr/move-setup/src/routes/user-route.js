
const bcrypt = require ('bcrypt');
const path = require('path');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client();
const userController = require("../controllers/user-controller.js");
const v = require ("validator");
const { create } = require('domain');
// GOOGLE_CLIENT_ID="470373993744-tjq6l6bk7ikvbvl46vpbd12pcqepuctb.apps.googleusercontent.com"
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
            const upState = await prisma.user.update({
                where:{username: username, },
                data:{isOnline: true}
            })
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
        // console.log("token is:", token);
        try{
            const payload_sig = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            })
            // console.log("a7aaa", payload_sig);
            const payloadn = payload_sig.payload.name;
            const payloade = payload_sig.payload.email;
            const payloadsub = payload_sig.payload.sub;
            let finalUsername = payloadn.replace(/\s+/g, "");
            const exist = await prisma.user.findUnique({
                where:{username: finalUsername}
            });
            if(exist){
                finalUsername =  finalUsername + Date.now();
            }
            // console.log(payloadn, payloade, payloadsub);
            const user = await prisma.user.upsert({
                where:{
                    email:payloade
                },
                update:{
                    email:payloade,
                    googleId: payloadsub,
                    isOnline: true
                },
                create:{
                    email:payloade,
                    username:finalUsername,
                    googleId: payloadsub,
                    isOnline:true
                }
            })
            const token = fastify.jwt.sign({
                email: user.email,
                id : user.id
            } , {expiresIn: "24h"} );
            // const setStatus = await prisma.user.update({
            //     where: {id:user.id},
            //     data:{isOnline: true}
            // }) this line dont make sense 
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
                    const avatarurl = "http://localhost:8281/" + newFile;
                    const upUser = await prisma.user.update({
                        where:{
                            id: request.user.id
                        },
                        data:{
                            avatar: avatarurl
                        }
                    })
                    console.log("DEBUG: ID value is:", request.user.id, " | ID Type is:", typeof request.user.id);
                    return reply.send({ user:upUser});
                    // ... the rest of your pipeline code
                    } catch (e) {
                        console.log("Parsing failed:", e.message);
                        return reply.status(500).send({ error: e.message }); // Add return here!
                    }
            }
            else{
                console.log("✅ NO FILE DETECTED!");
            }
            if(request.body)
            {
                    const {username, email, password} = request.body;
                    const updateData = {};
                    try{
                        if(username)
                        {
                            const  updu = await prisma.user.findUnique({
                                where:{username:username}
                            });
                            if( updu && updu.id != request.user.id)
                                {reply.status(400).send("Username already taken")
                                    return;}
                                    updateData.username = username;
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
                                    updateData.email = email;
                            }
                            if(password)
                            {
                                if(!v.isStrongPassword(password))
                                {
                                    reply.status(500).send("Password too weak: it must be at least 8 characters, include an uppercase letter, a number, and a symbol.");
                                    return ;
                                }
                                const mysalt =  await bcrypt.genSalt(10);
                                const myhash =  await bcrypt.hash(password, mysalt);
                                updateData.password = myhash;
                            }
                            const newuser = await prisma.user.update({
                                where:{id: request.user.id},
                                data:updateData
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

    fastify.get("/search", {preHandler :[fastify.jwtAuthFun]}, async function (request, reply)
    {
        const q =  request.query.q;
        // console.log("here is the query parameter: ",q,"||user request id lets see if the id is correct ", request.user);
        //  console.log("lets see the id inside user request", request.user.id);
        // or const {q} =  request.query;
        try{
            if(!q || q.length < 2)
            {
                reply.send([]);
                return;
            }
            const data = await prisma.user.findMany({
                where:{
                    username: {
                        contains: q,
                        mode: 'insensitive',
                    },
                    id:{
                        not: request.user.id,
                    }
                },
                select:{
                    username: true,
                    id: true,
                    avatar: true,
                }
            })
            reply.status(200).send({data});
        }
            catch(err){
                reply.status(500).send("we cant find that user to add ");
            }
    })
    fastify.post("/friends/request/:targetId", {preHandler:[fastify.jwtAuthFun]}, async function (request, reply) 
    {
        const userId = request.user.id;
        const postId = parseInt(request.params.targetId);
        try{
            const create_f = await prisma.friendship.create({
                data:{
                    requesterId:userId,
                    addresseeId: postId,
                }
            })
            reply.status(201).send(create_f);
        }
        catch (error) {
            // console.error("Error creating user:", error.message, error.meta);
            if(error.code == "P2002")
            {
                reply.status(500).send({
                error: "the friendhsip already created"
            });
            }
            reply.status(500).send("failed to send a friend request try again");
        }
    })
    fastify.get("/friends/pending", {preHandler:[fastify.jwtAuthFun]}, async function (request, reply) 
    {
        const findId = request.user.id;
        try{
            const find = await prisma.friendship.findMany({
                where:{
                    addresseeId: findId,
                    status: "pending",
                },
                include:{
                    requester:{
                        select:{
                            id: true,
                            avatar: true,
                            username: true,
                        }
                    }
                }

            })
            reply.status(200).send (find);

        }
        catch(error)
        {
            reply.status(500).send("no user has pending requests");
        }
    })
    fastify.patch("accept/:id", {preHandler:[fastify.jwtAuthFun]}, async function (request, reply)
    {
        const rowId =  parseInt(request.params.id);
        const receiverId = request.user.id;
        try{
            const checkFrienship = await  prisma.friendship.findUnique({
                where:{
                    id: rowId,
                }
            })
            if(!checkFrienship)
                return reply.status(404).send({ error: "Friend request not found" });
            if(checkFrienship.addresseeId !== receiverId)
                return reply.status(403).send({ error: "u cant accept this request" });
            const changeStatus = await prisma.friendship.update({
                where:{id:rowId},
                data:{status: "accepted"}
            });

            // reply.status(200).send("the request is accepted!");
            reply.status(200).send("the request is accepted!");
        }
        catch(error){

        }
    })    
    fastify.delete("/friends/request/:id", {preHandler:[fastify.jwtAuthFun]}, async function (request, reply)
    {
        const rowId =  parseInt(request.params.id);
        const receiverId = request.user.id;
        try{
            const checkFrienship = await  prisma.friendship.findUnique({
                where:{
                    id: rowId,
                }
            })
            if(!checkFrienship)
                return reply.status(404).send({ error: "Friend request not found" });
            // if(checkFrienship.addresseeId !== receiverId)
            if(checkFrienship.addresseeId !== receiverId && checkFrienship.requesterId !== receiverId)
                return reply.status(403).send({ error: "u cant decline this request" });
            const changeStatus = await prisma.friendship.delete({
                where:{id:rowId}
            });

            // reply.status(200).send("the request is accepted!");
            reply.status(200).send("the request is declined!");
        }
        catch(error){

        }
    })
    fastify.post("/logout", {preHandler: [fastify.jwtAuthFun]}, async function (request, reply)
    {
        const userId = request.user.id;
        try{
            const toOut = await prisma.user.update({
                where:{id:userId},
                data:{isOnline: false}
            })
            reply.status(200).send("user logout successfully!!!");
        }
        catch(error)
        {

        }
    })
}

module.exports = routes;
// @fastify/multipart: This is the "hands" that can open the FormData and extract the image.

// @fastify/static: This is the "display window." Once you save the image, you need a way for the browser to see it (e.g., http://localhost:8281/uploads/photo.jpg).