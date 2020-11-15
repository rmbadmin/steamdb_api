/**
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {object} options 
 * @param {Function} next
 */
export default (fastify, options, next) => {
    fastify.register(import('./apps/index.mjs'), {
        prefix: '/apps'
    })
    fastify.register(import('./packages/index.mjs'), {
        prefix: '/packages'
    })
    fastify.register(import('./realtime/index.mjs'), {
        prefix: '/realtime'
    })
    fastify.register(import('./db/index.mjs'), {
        prefix: '/db'
    })
    fastify.register(import('./users/index.mjs'), {
        prefix: '/users'
    })
    fastify.register(import('./workshop/index.mjs'), {
        prefix: '/workshop'
    })
    next()
}