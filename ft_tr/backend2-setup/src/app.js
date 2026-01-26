const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
// import cors from '@fastify/cors'
const cors = require('@fastify/cors')
const fastify = require('fastify')();
// ... rest of your code
// const fastify = require('fastify')({ logger: true });
fastify.register(cors, {
    hook: 'preHandler',
  })
const userRoutes = require("./routes/user-route");
fastify.register(userRoutes, {prefix: "/api/v1/users"});
const start = async()=>
{
    try{
        
        await fastify.listen(
            {
                port: 8281,
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