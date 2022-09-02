const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");
const StylelintPlugin = require("stylelint-webpack-plugin");

module.exports = merge(common, {
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        static: path.join(__dirname, "public")
    },
    plugins: [
        new ESLintPlugin({
            extensions: ["js", "jsx"]
        }),
        new StylelintPlugin()
    ]
});