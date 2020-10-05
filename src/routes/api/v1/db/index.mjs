import fs from 'fs/promises'
import path from 'path'
import formatNumber from 'short-number'
/**
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {object} options 
 * @param {Function} next
 */
export default async (fastify, options, next) => {
    var keys = await fastify.redis.dbsize()
    var keys_age = new Date().getTime()
    var keys_formatted = formatNumber(keys)
    var size = (await fs.stat(path.resolve('./dump.rdb'))).size
    var size_formatted = formatBytes(size)
    var size_age = new Date().getTime()
    var size_mem = Number((await fastify.redis.info('memory')).split('\n')[1].split(':')[1])
    var size_mem_formatted = formatBytes(size_mem)
    var size_mem_age = new Date().getTime()
    fastify.route({
        method: 'GET',
        url: '/size',
        schema: {
            tags: ['DB'],
            response: {
                200: {
                    size: {
                        type: 'number'
                    },
                    formatted: {
                        type: 'string'
                    }
                }
            }
        },
        handler: async (req, res) => {
            if ((new Date().getTime() - size_age) > 4 * 60 * 1000) {
                res.type('application/json').send(`{"size":${size},"formatted":"${size_formatted}"}`)
                size = (await fs.stat(path.resolve('./dump.rdb'))).size
                size_formatted = formatBytes(size)
                size_age = new Date().getTime()
            } else {
                res.type('application/json').send(`{"size":${size},"formatted":"${size_formatted}"}`)
            }
        }
    })
    fastify.route({
        method: 'GET',
        url: '/size/mem',
        schema: {
            tags: ['DB'],
            response: {
                200: {
                    size: {
                        type: 'number'
                    },
                    formatted: {
                        type: 'string'
                    }
                }
            }
        },
        handler: async (req, res) => {
            if ((new Date().getTime() - size_mem_age) > 4 * 60 * 1000) {
                res.type('application/json').send(`{"size":${size},"formatted":"${size_mem_formatted}"}`)
                size_mem = Number((await fastify.redis.info('memory')).split('\n')[1].split(':')[1])
                size_mem_formatted = formatBytes(size_mem)
                size_mem_age = new Date().getTime()
            } else {
                res.type('application/json').send(`{"size":${size_mem},"formatted":"${size_mem_formatted}"}`)
            }
        }
    })
    fastify.route({
        method: 'GET',
        url: '/keys',
        schema: {
            tags: ['DB'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        keys: {
                            type: 'number'
                        },
                        formatted: {
                            type: 'string'
                        }
                    }
                }
            }
        },
        handler: async (req, res) => {
            if ((new Date().getTime() - keys_age) > 4 * 60 * 1000) {
                res.type('application/json').send(`{"keys":${keys},"formatted":"${keys_formatted}"}`)
                keys = await fastify.redis.dbsize()
                keys_age = new Date().getTime()
                keys_formatted = formatNumber(keys)
            } else {
                res.type('application/json').send(`{"keys":${keys},"formatted":"${keys_formatted}"}`)

            }
        }
    })
    next()
}

function formatBytes(a, b = 2) {
    if (0 === a) return "0 Bytes";
    const c = 0 > b ? 0 : b,
        d = Math.floor(Math.log(a) / Math.log(1024));
    return parseFloat((a / Math.pow(1024, d)).toFixed(c)) + " " + ["Bytes", "KB", "MB", "GB",
        "TB", "PB", "EB", "ZB", "YB"
    ][d]
}