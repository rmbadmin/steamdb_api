/**
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {object} options 
 * @param {Function} next
 */
export default (fastify, options, next) => {
    fastify.register(import('./api/v1/index.mjs'), {
        prefix: '/v1'
    })
    next()
}