// const path = require("path");

module.exports = {
    entry: "./src/index.jsx",
    output: {
        // path: path.join(__dirname, "public"),
        path: __dirname,
        filename: "index.js"
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
    }
};