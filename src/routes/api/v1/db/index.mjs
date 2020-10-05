import fs from 'fs/promises'
import path from 'path'
import formatNumber from 'short-number'
/**
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {object} options 
 * @param {Function} next
 */
export default async (fastify, options, next) => {
    var keys = (await fastify.redis.scan(0, 'MATCH', '*', 'COUNT', 99999999))[1].length
    var keys_age = new Date().getTime()
    var keys_formatted = formatNumber(keys)
    var size = (await fs.stat(path.resolve('./dump.rdb'))).size
    var size_formatted = formatBytes(size)
    var size_age = new Date().getTime()
    console.log({
        keys,
        keys_age,
        keys_formatted,
        size,
        size_formatted,
        size_age
    })
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
                keys = (await fastify.redis.scan(0, 'MATCH', '*', 'COUNT', 999999999999))[1].length
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