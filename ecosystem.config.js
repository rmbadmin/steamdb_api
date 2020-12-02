module.exports = {
    apps:[
        {
            name:'SteamDB-API',
            script:'src/index.mjs',
            instances  : 'max',
            exec_mode  : "cluster",
            env:{
                PORT:3010,
                REDIS_HOST:'localhost',
                REDIS_PORT:4009
            }
        }
    ],
    deploy:{
        prod:{
            user:'root',
            host:['hermes.trbo.sh'],
            ref:'origin/prod',
            repo:'git@github.com:SteamDB-API/api',
            path:'/root/node/steamdb/api',
            'post-deploy':'npm i; pm2 startOrRestart ecosystem.config.js',
        }
    }
}