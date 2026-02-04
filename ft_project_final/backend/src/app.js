const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const cors = require('@fastify/cors')
const fastify = require('fastify')();
const multipart = require('@fastify/multipart');
const static = require('@fastify/static');
// const fastify = require('fastify')({ logger: true });
fastify.register(cors, {
    hook: 'preHandler',
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
  fastify.register(multipart);
  fastify.register(static,{
    root: path.join(__dirname, ".." ,'uploads'),
    prefix: "/uploads/"
  });
  console.log("the absulte path of the directory", path.join(__dirname, 'uploads'));
  const jwtw = require("./routes/plugin");
  fastify.register(jwtw);
const userRoutes = require("./routes/user-route");
const { stat } = require('fs');
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