// const fastify = require('fastify');
// console.log("opsss");
// setInterval(() => {}, 1000);
const fastify = require('fastify')({ logger: true });
const userRoutes = require("./routes/user-route");
fastify.register(userRoutes, {prefix: "/api/v1/users"});

const start = async()=>
{
    try{

        await fastify.listen(
            {
                port: 8081,
                host: '0.0.0.0'
            }
        );
        fastify.log.info(
            `server is running on port ${fastify.server.address().port}`
        )
    }
    catch(err)
    {
        console.log(err);
    }
}
start();