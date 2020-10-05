import parser from 'fast-xml-parser'
import he from 'he'
import fs from 'fs/promises'
import _fs from 'fs'
import path from 'path'
/**
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {object} options 
 * @param {Function} next
 */
export default (fastify, options, next) => {
    fastify.route({
        method: 'GET',
        url: '/:id',
        schema: {
            params: {
                id: {
                    type: 'string'
                }
            }
        },
        handler: async (req, res) => {
            var user = await fastify.redis.get(`user:${req.params.id}`)
            if (user) user = JSON.parse(user)
            if (!user || ((new Date().getTime() - user.last_requested) > 2 * 24 * 60 * 60 * 1000)) {
                var resp = await fastify.fetch(`https://steamcommunity.com/profiles/${(user?user.steamID64:null)||req.params.id}?xml=1`)
                var json = parser.parse(await resp.text(), {
                    attributeNamePrefix: "@_",
                    attrNodeName: "attr", //default is 'false'
                    textNodeName: "#text",
                    ignoreAttributes: true,
                    ignoreNameSpace: false,
                    allowBooleanAttributes: false,
                    parseNodeValue: true,
                    parseAttributeValue: false,
                    trimValues: true,
                    cdataTagName: "", //default is 'false'
                    cdataPositionChar: "\\c",
                    parseTrueNumberOnly: true,
                    arrayMode: false, //"strict"
                    attrValueProcessor: (val, attrName) => he.decode(val, {
                        isAttributeValue: true
                    }), //default is a=>a
                    tagValueProcessor: (val, tagName) => he.decode(val), //default is a=>a
                })
                if (!json.profile && json.response) return res.callNotFound()
                json.profile.last_requested = new Date().getTime()
                await fastify.redis.set(`user:${json.profile.steamID64}`, JSON.stringify(json.profile))
                user = json.profile
            }
            delete user.last_requested
            res.send(user)
        }
    })
    fastify.route({
        method: 'GET',
        url: '/:id/avatar.jpg',
        schema: {
            params: {
                id: {
                    type: 'string'
                }
            },
            querystring: {
                size: {
                    type: 'string',
                    pattern: '(small|medium|large)'
                }
            }
        },
        handler: async (req, res) => {
            var user = await fastify.redis.get(`user:${req.params.id}`)
            if (user) user = JSON.parse(user)
            if (!user || ((new Date().getTime() - user.last_requested) > 2 * 24 * 60 * 60 * 1000)) {
                var resp = await fastify.fetch(`https://steamcommunity.com/profiles/${(user?user.steamID64:null)||req.params.id}?xml=1`)
                var json = parser.parse(await resp.text(), {
                    attributeNamePrefix: "@_",
                    attrNodeName: "attr", //default is 'false'
                    textNodeName: "#text",
                    ignoreAttributes: true,
                    ignoreNameSpace: false,
                    allowBooleanAttributes: false,
                    parseNodeValue: true,
                    parseAttributeValue: false,
                    trimValues: true,
                    cdataTagName: "", //default is 'false'
                    cdataPositionChar: "\\c",
                    parseTrueNumberOnly: true,
                    arrayMode: false, //"strict"
                    attrValueProcessor: (val, attrName) => he.decode(val, {
                        isAttributeValue: true
                    }), //default is a=>a
                    tagValueProcessor: (val, tagName) => he.decode(val), //default is a=>a
                })
                if (!json.profile && json.response) return res.callNotFound()
                json.profile.last_requested = new Date().getTime()
                await fastify.redis.set(`user:${json.profile.steamID64}`, JSON.stringify(json.profile))
                user = json.profile
            }
            var size = req.query.size || 'medium'
            if (_fs.existsSync(path.resolve(`./avatars/${user.steamID64}_${size}.jpg`))) {
                var stat = await fs.stat(path.resolve(`./avatars/${user.steamID64}_${size}.jpg`))
                var age = stat.mtime || stat.ctime
                age = (new Date().getTime() - age.getTime())
                if (age > 2 * 24 * 60 * 60 * 1000) {
                    var url = ''
                    if (size == 'small') {
                        url = user.avatarIcon
                    } else if (size == 'medium') {
                        url = user.avatarMedium
                    } else if (size == 'large') {
                        url = user.avatarFull
                    }
                    var resp = await fastify.fetch(url)
                    var image = await resp.buffer()
                    await fs.writeFile(path.resolve(`./avatars/${user.steamID64}_${size}.jpg`), image)
                    res.type('image/jpg').send(image)
                } else {
                    res.sendFile(`${user.steamID64}_${size}.jpg`, path.resolve(`./avatars/`))
                }
            } else {
                var url = ''
                if (size == 'small') {
                    url = user.avatarIcon
                } else if (size == 'medium') {
                    url = user.avatarMedium
                } else if (size == 'large') {
                    url = user.avatarFull
                }
                var resp = await fastify.fetch(url)
                var image = await resp.buffer()
                await fs.writeFile(path.resolve(`./avatars/${user.steamID64}_${size}.jpg`), image)
                res.type('image/jpg').send(image)
            }

        }
    })
    next()
}