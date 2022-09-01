const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");
const StylelintPlugin = require("stylelint-webpack-plugin");

module.exports = {
    entry: "./src/index.jsx",
    output: {
        path: path.join(__dirname, "public"),
        filename: "index.js"
    },
    devServer: {
        static: path.join(__dirname, "public")
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: "babel-loader"
            },
            {
                test: /\.css$/,
                // applied in reverse order
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    plugins: [
        new ESLintPlugin({
            extensions: ["js", "jsx"]
        }),
        new StylelintPlugin()
    ]
};