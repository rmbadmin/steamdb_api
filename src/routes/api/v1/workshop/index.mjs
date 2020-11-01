import SteamWorkshop from 'steam-workshop'
import path from 'path'
const steamWorkshop = new SteamWorkshop(path.resolve('./temp'))
/**
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {object} options 
 * @param {Function} next
 */
export default async (fastify, options, next) => {
    fastify.route({
        method: 'GET',
        url: '/collection/:id',
        schema: {
            tags: ['Workshop']
        },
        handler: async (req, res) => {
            var invalid = await fastify.redis.get(`workshop:collection:${req.params.id}:invalid`)
            if (invalid) return res.callNotFound()
            var item = await fastify.redis.get(`workshop:collection:${req.params.id}:info`)
            if (!item) {
                steamWorkshop.getPublishedFileDetails([req.params.id], async (err, files) => {
                    if (err) throw err
                    if (!files[0] || (files[0].result == 9)) {
                        res.callNotFound()
                        await fastify.redis.set(`workshop:collection:${files[0].publishedfileid}:invalid`, true)
                    } else {
                        res.send(files[0])
                        files[0].age = new Date().getTime()
                        await fastify.redis.set(`workshop:collection:${files[0].publishedfileid}:info`, JSON.stringify(files[0]))
                    }
                })
            } else {
                item = JSON.parse(item)
                if ((new Date().getTime() - item.age) > 10 * 24 * 60 * 60 * 1000) {
                    steamWorkshop.getPublishedFileDetails([req.params.id], async (err, files) => {
                        if (err) throw err
                        res.send(files[0])
                        files[0].age = new Date().getTime()
                        await fastify.redis.set(`workshop:collection:${files[0].publishedfileid}:info`, JSON.stringify(files[0]))
                    })
                } else {
                    delete item.age
                    res.send(item)
                }
            }

        }
    })
    fastify.route({
        method: 'GET',
        url: '/item/:id',
        schema: {
            tags: ['Workshop']
        },
        handler: async (req, res) => {
            var invalid = await fastify.redis.get(`workshop:item:${req.params.id}:invalid`)
            if (invalid) return res.callNotFound()
            var item = await fastify.redis.get(`workshop:item:${req.params.id}:info`)
            if (!item) {
                steamWorkshop.getPublishedFileDetails([req.params.id], async (err, files) => {
                    if (err) throw err
                    if (!files[0] || (files[0].result == 9)) {
                        res.callNotFound()
                        await fastify.redis.set(`workshop:item:${files[0].publishedfileid}:invalid`, true)
                    } else {
                        res.send(files[0])
                        files[0].age = new Date().getTime()
                        await fastify.redis.set(`workshop:item:${files[0].publishedfileid}:info`, JSON.stringify(files[0]))
                    }
                })
            } else {
                item = JSON.parse(item)
                if ((new Date().getTime() - item.age) > 10 * 24 * 60 * 60 * 1000) {
                    steamWorkshop.getPublishedFileDetails([req.params.id], async (err, files) => {
                        if (err) throw err
                        res.send(files[0])
                        files[0].age = new Date().getTime()
                        await fastify.redis.set(`workshop:item:${files[0].publishedfileid}:info`, JSON.stringify(files[0]))
                    })
                } else {
                    delete item.age
                    res.send(item)
                }
            }

        }
    })
}