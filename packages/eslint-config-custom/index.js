module.exports = {
  extends: ["next", "turbo", "prettier"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    eqeqeq: ["error", "smart"],
    curly: "error",
    quotes: ["error", "double"],
    semi: ["error", "never"],
  },
  parserOptions: {
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
  },
}
