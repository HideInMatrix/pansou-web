module.exports = {
  apps: [
    {
      name: "pansou-web",
      port: "3000",
      exec_mode: "cluster",
      instances: "max",

      // 1. 脚本字段指向实际要执行的 ESM 文件
      script: "./.output/server/index.mjs",

      // 2. 明确指定解释器为 Node.js
      // 关键：这避免了 PM2 内部对 script 字段的复杂CJS加载处理。
      interpreter: "node",

      // 3. 移除 args 字段，因为它会被 interpreter 属性取代

      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
