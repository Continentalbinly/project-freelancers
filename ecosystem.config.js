module.exports = {
  apps: [
    {
      name: "unijobs-test",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      cwd: "/var/www/test.unijobs.app",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "unijobs-prod",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "/var/www/unijobs.app",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
