import crypto from 'crypto'
/**
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {object} options 
 * @param {Function} next
 */
var fn = async (fastify, options, next) => {
    var app_cache = []
    var app_cache_age = new Date().getTime()
    fastify.route({
        method: 'GET',
        url: '/',
        schema: {
            tags: ['Apps'],
            response: {
                200: {
                    apps: {
                        type: 'array',
                        items: {
                            type: 'string',
                            example: 'app.id'
                        }
                    },
                    count: {
                        type: 'number',
                        example: 1
                    }
                }
            }
        },
        handler: async (req, res) => {
            if ((new Date().getTime() - app_cache_age) > 4 * 60 * 1000) {
                res.send({
                    apps: app_cache,
                    count: app_cache.length
                })
                app_cache = (await fastify.redis.scan(0, 'MATCH', 'app:*:info', 'COUNT', 99999999))[1].map(e => e.match(/app:([0-9]{0,100}):info/)[1]).sort((a, b) => Number(a) - Number(b))
                app_cache_age = new Date().getTime()
            } else {
                res.send({
                    apps: app_cache,
                    count: app_cache.length
                })
            }
        }
    })
    fastify.route({
        method: 'GET',
        url: '/:app_id',
        schema: {
            tags: ['Apps'],
            params: {
                type: 'object',
                properties: {
                    app_id: {
                        type: 'string'
                    }
                }
            },
            response: {
                200: {
                    changenumber: {
                        type: 'number'
                    },
                    appinfo: {
                        type: 'object'
                    }
                }
            }
        },
        handler: async (req, res) => {
            var app = await fastify.redis.get(`app:${req.params.app_id}:info`)
            if (app) {
                res.type('application/json').send(app)
            } else {
                try {
                    app = await getApp(req.params.app_id)
                    var message = JSON.stringify(app)
                    res.type('application/json').send(message)
                    fastify.redis.set(`package:${req.params.app_id}:info`, message)
                } catch (error) {
                    if (error.message == 'error') return res.callNotFound()
                    else throw error
                }
            }
        }
    })
    fastify.route({
        method: 'GET',
        url: '/:app_id/changelogs',
        schema: {
            tags: ['Apps'],
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'string',
                        example: 'changelog.id'
                    }
                }
            }
        },
        handler: async (req, res) => {
            var app = await fastify.redis.get(`app:${req.params.app_id}:info`)
            if (!app) return res.callNotFound()
            var changelogs = (await fastify.redis.scan(0, 'MATCH', `changelog:app:${req.params.app_id}:*`, 'COUNT', 99999999))[1].map(e => e.match(new RegExp(`changelog:app:${req.params.app_id}:([0-9]{0,})`))[1]).sort((a, b) => parseInt(b) - parseInt(a))
            res.send(changelogs)
        }
    })
    fastify.route({
        method: 'GET',
        url: '/:app_id/changelog/:changelog_id',
        schema: {
            tags: ['Apps'],
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            kind: {
                                type: 'string',
                            },
                            path: {
                                type: 'array',
                                items: {
                                    type: 'string'
                                }
                            },
                            lhs: {

                            },
                            rhs: {

                            }
                        }
                    }
                }
            }
        },
        handler: async (req, res) => {
            var changelog = await fastify.redis.get(`changelog:app:${req.params.app_id}:${req.params.changelog_id}`)
            if (!changelog) return res.callNotFound()
            res.send(JSON.parse(changelog))
        }
    })
    next()

    function getApp(appid, timeout = 5000) {
        return new Promise((res, rej) => {
            var _timeout = setTimeout(() => {
                rej('error')
            }, timeout)
            fastify.steam.getProductInfo([appid], [], (err, apps, packages, unknownApps, unknownPackages) => {
                clearTimeout(_timeout)
                _timeout = null
                if (apps.length == 0 && unknownApps.length == 1) return rej('error')
                res(apps[Object.keys(apps)[0]])
            })
        })
    }
    app_cache = (await fastify.redis.scan(0, 'MATCH', 'app:*:info', 'COUNT', 99999999))[1].map(e => e.match(/app:([0-9]{0,100}):info/)[1]).sort((a, b) => Number(a) - Number(b))
}
fn[Symbol.for('fastify.display-name')] = 'apps'
export default = fn