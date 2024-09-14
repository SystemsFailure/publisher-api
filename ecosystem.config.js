module.exports = {
  apps: [{
    name: 'publisher-api',
    script: "./dist/src/index.js",
    env_production: {
      NODE_ENV: 'production',
      PORT: 3035,
    }
  }]
};