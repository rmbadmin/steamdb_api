import _fastify from 'fastify'
import path from 'path'
import fs from 'fs/promises'
import dotenv from 'dotenv'
import _fs from 'fs'
import StatsD from 'hot-shots'
dotenv.config()
const fastify = _fastify({
    logger: {
        level: 'debug'
    },
    ignoreTrailingSlash: true,
})
fastify.decorate('stats',new StatsD())
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
            version: '1.2.0',
        },
        consumes: ['application/json'],
        produces: ['application/json'],
        servers: [{
            url: 'https://api.steamdb.ml',
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
                name: 'Users'
            },
            {
                name: 'Workshop'
            },
            {
                name: 'DB'
            }
        ],
    },
    exposeRoute: {
        ui:false,
        json:true,
        yaml:true
    }
})
fastify.register(import('fastify-static'), {
    root: path.resolve('./views'),
    serve: true,
    prefixAvoidTrailingSlash: true,
})
fastify.get('/',{
    schema:{
        hide:true
    }
},(req,res)=>{
    res.redirect('https://steamdb.ml')
})
fastify.addHook('onReady', (done) => {
    fastify.oas()
    done()
})
fastify.register(import('./routes/index.mjs'))
fastify.listen(process.env.PORT || 3000).then(e => console.log(`Listening On ${e}`))
if (!_fs.existsSync(path.resolve('./avatars'))) await fs.mkdir(path.resolve('./avatars'))