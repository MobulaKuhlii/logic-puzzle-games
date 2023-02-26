const path = require("path");

module.exports = {
    entry: "./src/index.tsx",
    output: {
        path: path.join(__dirname, "public"),
        filename: "index.js"
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: "ts-loader"
            },
            {
                test: /\.css$/,
                // applied in reverse order
                use: ["style-loader", "css-loader"]
            }
        ]
    }
};