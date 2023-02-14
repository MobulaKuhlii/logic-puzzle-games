const { merge } = require("webpack-merge");
const common = require("./webpack.common");
const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");
const StylelintPlugin = require("stylelint-webpack-plugin");

module.exports = merge(common, {
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        static: path.join(__dirname, "public"),
        port: 8081
    },
    plugins: [
        new ESLintPlugin({
            extensions: ["ts", "tsx"]
        }),
        new StylelintPlugin()
    ]
});