/**
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {object} options 
 * @param {Function} next
 */
export default (fastify, options, next) => {
    fastify.route({
        url:'/bandwidth',
        method:'GET',
        handler:async(req,res)=>{
            res.send(JSON.parse(await fastify.redis.get('STEAM_DB:STEAM:BANDWIDTH')))
        }
    })
    next()
}