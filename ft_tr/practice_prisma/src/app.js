const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const fastify = require('fastify')();
// ... rest of your code
// const fastify = require('fastify')({ logger: true });
const userRoutes = require("./routes/user-route");
fastify.register(userRoutes, {prefix: "/api"});
const start = async()=>
    {
        try{
            await fastify.listen(
                {
                    port: 8281,
                    host: '0.0.0.0'
                },
                console.log("siham ")
            );
            fastify.log.info(
                `server is running on port ${fastify.server.address().port}`
            )
        }
        catch(err)
        {
            console.log(err);
        }
        // console.log("aaaaaaa");
}
start();