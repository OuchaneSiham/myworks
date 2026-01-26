
const fastify = require('fastify')({ logger: true });
JWT_KEY="trez1337"
fastify.register(require('@fastify/jwt'), {
    secret: JWT_KEY,
  })
const bcrypt = require ('bcrypt');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client();
const userController = require("../controllers/user-controller.js");
 const { PrismaClient } = require('@prisma/client');
 const { PrismaPg } = require("@prisma/adapter-pg");
 GOOGLE_CLIENT_ID="470373993744-tjq6l6bk7ikvbvl46vpbd12pcqepuctb.apps.googleusercontent.com"
 const v = require ("validator");
const { create } = require('domain');
 const adapter = new PrismaPg({
  connectionString: "postgresql://neondb_owner:npg_vU5DYjMsnwG4@ep-sweet-lab-a4spkatp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});
const prisma = new PrismaClient({ adapter });

async function routes(fastify, options) {
    fastify.get("/find", async function (request, reply) 
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
                        console.log("this is the token", token);
        //     reply.status(201).send({
        //             success: true,
        //             message: "User created successfulely!",
        //             user
        //     }
        // );
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
            // "password": "Alpha!@bera1337"
            console.log("sihammmm", result);
            if(result == false)
                reply.status(500).send({error: "wrong password try again!"});
            // console.log("aaaaaaaaaa", exist.password);
            // console.log("bbbbbbbbbbbbbb", exist.username);
            // const authHeader = request.headers['authorization'];
            // const authHeader = request.headers;
            // console.log(authHeader);
            // if(!authHeader)
            //     {
            //         reply.status(401).send({error: "no auth header2"});
            //     }
            //     const [authType, authKey] = authHeader.split(" ");
            //     if(authType !== 'Bearer')
            //         {
            //             return reply.status(401).send({error: " requires bearer auth"});
            //         }
            //         // console.log("siham aaaaaaaaaaa:::: key", authKey);
            //         // console.log("siham aaaaaaaaaaa:::: type", authType);
            //     request.user = jwt.verify(authKey, process.env.JWT_KEY);
            //     // reply.send(verfiy);
            //     console.log("infos", request.user);
    // }
    // catch(error)
    // {
    //     reply.status(401).send({error: "not match"});
    // }

            reply.status(200).send("login s",{
                username: exist.username,
                email: exist.email
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
        console.log(token);
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
                    email:email,
                    username:payloadn,
                    googleId: payloadsub,
                }
            })
            console.log(user);
        }
        catch(error)
        {

        }
    })

}

module.exports = routes;