module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-custom`
  extends: ["custom"],
  "prettier/prettier": [
    "error",
    {
      singleQuote: false,
      trailingComma: "all",
      semi: false,
    },
  ],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
}
