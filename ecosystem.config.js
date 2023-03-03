module.exports = {
  apps: [
    {
      name: 'onchain-api',
      script: 'npm',
      automation: false,
      args: 'run start',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      restart_delay: 3000,
      exp_backoff_restart_delay: 100
    },
  ],
};
