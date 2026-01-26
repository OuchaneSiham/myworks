const userController = require("../controllers/user-controller.js");
 const { PrismaClient } = require('@prisma/client');
 const { PrismaPg } = require("@prisma/adapter-pg");
const { errorCodes } = require("fastify");
 const adapter = new PrismaPg({
  connectionString: "postgresql://neondb_owner:npg_vU5DYjMsnwG4@ep-sweet-lab-a4spkatp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

const prisma = new PrismaClient({ adapter });

async function routes(fastify, options) {
    fastify.get("/register", userController.registration);
    
    fastify.post("/register", async (request, reply) => {
        const { name, email } = request.body;
        
        console.log('Received:', { name, email });
        
        try {
            const user = await prisma.user.create({data: {name, email}});
            reply.status(201).send({
                success: true,
                message: "User created successfulelyyrrtttrr!",
                user
            });
        } catch (error) {
            console.error("Error creating user:", error.message);
            reply.status(500).send({
                success: false,
                error: error.message,
                errorCodes: error.errorCodes
            });
        }
    });
    fastify.post("/register/many", async function (request, reply)
    {
        const {users} = request.body;
        try
        {
            const urs = await prisma.user.createMany({
                data: users,
            })
            reply.send(urs);
        }catch(error)
        {
            reply.status(500).send(error);
        }
    })
    fastify.get("/find", async function (request, reply) 
    {
        try{
            // const item = await prisma.user.findFirst();
            // const fmany = await prisma.user.findMany();
            // const by = await prisma.user.findUnique({where: {id : 4}});
            // const by = await prisma.user.findMany({where:{ lose_points: {equals: 0}, win_points: {lt: 3}}});
            const by = await prisma.user.findMany({where: { 
            //     OR :[
            //     {win_points: 0},
            //     {lose_points: 3} // this methodn is tolong u can use in
            // ]
                // lose_points:{
                //     in:[1, 10, 19]
                // },
                OR:[
                    {lose_points: {
                        in:[1, 10, 19]
                    }},
                    {win_points:{
                        in:[1, 0, 2]
                    }}
                ]
        }
            });
            //u an also use it for email cz its unique nt the name uts nin unque
            // reply.send("hello");
            reply.send(by);
        }
        catch(err)
        {
            reply.status(500).send(err);
        }
    })

    fastify.put("/update", async function (request, reply) 
    {
        const updatedUser = await prisma.user.update({
            where:{id: 2},
            data:{
                 name: "souchane",
                 win_points: 6,
            },
        });
        reply.send(updatedUser);
    })
    fastify.delete("/delete", async function (request, reply) 
    {
        // const deleted = await prisma.user.delete({
        // where:{email: "diana@example.com"}
        // });
        // reply.send(deleted);
        // u can also do delte many
        const deleted = await prisma.user.deleteMany({
        where:{id : {lt: 2}} 
        });

    })
}

module.exports = routes;

// fastify.post("/google-auth", async function (request, reply) 
// {
//     console.log("helloooo");
//     const {token} = request.body 
//     try{
//         const ticket = await client.verifyIdToken({
//             idToken: token,
//             audience: GOOGLE_CLIENT_ID,
//         },
//     )
//     // const { sub, email, name } = payload;
//     const payload = ticket.getPayload();
//     const sub = payload['sub'];
//     const email = payload['email'];
//     const name = payload['name'];

//     const user = await prisma.user.upsert({
//         where:{
//             email: email,
//         },
//         update:{
//                 username: name,
//             },
//         create:{
//                 email: email,
//                 username: name ,
//             },
//     })
//     reply.send(user);
//     reply.status(200).send(user
//     // ,{
//     //     // username: user.username,
//     //     // email: user.email
//     // }
// );
// console.log(user);
//     }
//     catch(error)
//     {
//         reply.status(500).send(error);
//     }
//     // console.log(token);
// })