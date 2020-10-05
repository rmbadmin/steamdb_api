import _fastify from 'fastify'
import path from 'path'
import fs from 'fs/promises'
import dotenv from 'dotenv'
import _fs from 'fs'
dotenv.config()
const fastify = _fastify({
    logger: {
        level: 'debug'
    },
    ignoreTrailingSlash: true,
})
fastify.addHook('onRequest', (req, res, next) => {
    req.hrtime = process.hrtime()
    req.user = {
        ip: req.headers['cf-connecting-ip'] || req.connection.remoteAddress,
        ua: req.headers["user-agent"] || 'NO_UA'
    }
    next()
})
fastify.addHook('onSend', async (req, res, payload) => {
    console.log(`${res.statusCode} "${req.method}:${req.url}" [${(process.hrtime(req.hrtime)[1]/1000000).toFixed(2)}ms] [${payload?formatBytes(payload.filename?(await fs.stat(payload.filename)).size:payload.length):'Unknown'}] [${req.user.ip}:${req.connection.remotePort}] [${req.user.ua}]`)
    return
})
fastify.register(import('fastify-reply-from'), {
    base: 'http://arc.io/'
})
fastify.register(import('fastify-fetch'))
fastify.register(import('fastify-redis'), {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
})
fastify.register(import('fastify-redis'), {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    namespace: 'listener'
})
fastify.register(import('fastify-oas'), {
    routePrefix: '/docs',
    addModels: true,
    swagger: {
        info: {
            title: 'SteamDB API',
            description: 'Documentation for the SteamDB API<br><a href="/docs/websockets">Websocket Documentation</a>',
            version: '2.0.0',
        },
        consumes: ['application/json'],
        produces: ['application/json'],
        servers: [{
            url: 'https://steamdb.ml',
            description: 'Offical SteamDB Server'
        }, {
            url: 'http://localhost:3000',
            description: 'Local server.',
        }],
        tags: [{
                name: 'Apps'
            },
            {
                name: 'Packages'
            },
            {
                name: 'DB'
            }
        ],
    },
    exposeRoute: true
})
fastify.register(import('fastify-static'), {
    root: path.resolve('./views'),
    serve: true,
    prefixAvoidTrailingSlash: true,
})
fastify.addHook('onReady', (done) => {
    fastify.oas()
    done()
})
fastify.register(import('./routes/index.mjs'))
fastify.listen(process.env.PORT || 3000, '0.0.0.0')
if (!_fs.existsSync(path.resolve('./avatars'))) await fs.mkdir(path.resolve('./avatars'))

function formatBytes(a, b = 2) {
    if (0 === a) return "0 Bytes";
    const c = 0 > b ? 0 : b,
        d = Math.floor(Math.log(a) / Math.log(1024));
    return parseFloat((a / Math.pow(1024, d)).toFixed(c)) + " " + ["Bytes", "KB", "MB", "GB",
        "TB", "PB", "EB", "ZB", "YB"
    ][d]
}