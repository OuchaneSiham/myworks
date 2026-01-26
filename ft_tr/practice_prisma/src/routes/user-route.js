const userController = require("../controllers/user-controller.js");
 const { PrismaClient, Prisma } = require('@prisma/client');
 const { PrismaPg } = require("@prisma/adapter-pg");
 const adapter = new PrismaPg({
  connectionString: "postgresql://neondb_owner:npg_g0KYjGV4Rspq@ep-jolly-frost-ahhhmk27-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

const prisma = new PrismaClient({ adapter });

async function routes(fastify, options) {
    fastify.get("/users", async (request, reply) => {
        console.log("aaaaaaa");
        const posts = await prisma.user.findMany();
        reply.status(200).send(posts);
        // console.log("aaaaaaa");
    });
     fastify.post("/Createsingle", async (request, reply) => {
        
        const posts = await prisma.user.create({
            data: request.body
        });
        reply.status(200).send(posts);
    });
    fastify.post("/Createmany", async (request, reply) => {
            const {users} = request.body;
            const sameusers = [];
            try{

                for(const user of users)
                {
                    const usrs = await prisma.user.create({
                        data: user,
                    });
                    sameusers.push(usrs);
                }
            reply.status(200).send({
                sameusers
            });
            }
            catch(err)
            {
                reply.status(500).send(err);
                // console.log(err);
            }
    });
    fastify.get("/find", async function (request, reply) 
    {
        try{
            const f = await prisma.user.findMany({
                // where:{
                //     OR:[
                //         {name:{
                //             in:[
                //                 // {startsWith: "d"},{endsWith:"k"},contains also 
                //                 "jack", "Sara"
                //             ]
                //         }},
                //        { id : {lt:2}}
                //     ]
                // }

                //filter using relations tables
                where:{
                    posts:{
                        // some:{// give me users at least of them is published true 
                        // every:{
                            // we will change evry to some cz every if same user have one post true and false it wont return the true one it means  wont return the user even thout published trur
                        none: {// give me any usrer that non published yet
                            published:false
                        }
                    }
                }
            })
            reply.status(200).send(f);
        }
        catch(err)
        {
             reply.status(500).send(err);
        }
    })
    fastify.get("/aggregate", async function (request, reply) 
    {
        try{
            // Aggregate = to gather things together into one
            // count, sum, avg, min, max 
            const aggregations = await prisma.post.aggregate({
                _sum:{
                    likeNum:true
                },
                _avg:{
                    likeNum:true
                },
                _count:{
                    likeNum:true
                },
                _min:{
                    likeNum:true
                },
                _max:{
                    likeNum:true
                }
            })
            reply.status(200).send(aggregations);
        }
        catch(err)
        {
             reply.status(500).send(err);
        }
    })
        fastify.get("/groupby", async function (request, reply) 
    {
        try{
            //group by here we gonna take for example likes of the same user , i mean treat with each user

            const groups = await prisma.post.groupBy({
                by:["authorId"],
                _sum:{
                    likeNum:true
                },
                _count:{
                    likeNum:true
                }
            })
            reply.status(200).send(groups);
        }
        catch(err)
        {
             reply.status(500).send(err);
        }
    })
    fastify.get("/sort", async function (request, reply) 
    {
        try{
            const sort = await prisma.post.findMany({

                orderBy:{
                    // likeNum:"asc",
                    likeNum:"desc"
                }
            })
            reply.status(200).send(sort);
        }
        catch(err)
        {
             reply.status(500).send(err);
        }
    })

    fastify.get("/pagination", async function (request, reply) 
    {
        try{
            const sort = await prisma.post.findMany({

                orderBy:{
                    // likeNum:"asc",
                    likeNum:"desc"
                }
            })
            reply.status(200).send(sort);
        }
        catch(err)
        {
             reply.status(500).send(err);
        }
    })
}

module.exports = routes;