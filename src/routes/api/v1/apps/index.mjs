/**
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {object} options 
 * @param {Function} next
 */
export default async (fastify, options, next) => {
    var app_cache = (await fastify.redis.scan(0, 'MATCH', 'app:*:info', 'COUNT', 99999999))[1].map(e => e.match(/app:([0-9]{0,100}):info/)[1]).sort((a, b) => Number(a) - Number(b))
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
            if (!app) return res.callNotFound()
            res.type('application/json').send(app)
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
}