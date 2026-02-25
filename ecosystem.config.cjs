module.exports = {
  apps: [
    {
      name: 'chickenbro-server',
      script: 'server/index.js',
      cwd: '/opt/chickenbro',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/opt/chickenbro/logs/server-error.log',
      out_file: '/opt/chickenbro/logs/server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true
    }
  ]
}
