import fs from 'fs/promises'
import path from 'path'
/**
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {object} options 
 * @param {Function} next
 */
export default (fastify, options, next) => {
    fastify.get('/docs/websockets', {
        schema: {
            hide: true
        }
    }, (req, res) => {
        res.sendFile('websocket.html')
    })
    fastify.get('/arc-sw.js', {
        schema: {
            hide: true
        }
    }, (req, res) => {
        res.from('/arc-sw.js')
    })
    next()
}