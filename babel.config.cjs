module.exports = {
    presets: [
      ["@babel/preset-env", { targets: { node: "current" }, modules: true }],
      "@babel/preset-typescript",
    ],
  };