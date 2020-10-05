module.exports = {
    apps: [{
        name: "SteamDB-API",
        script: "./src/index.mjs",
        instances: 4,
        exec_mode: "cluster",
        watch: false,
        increment_var: 'PORT',
        env: {
            "PORT": 3009,
        }
    }]
}