module.exports = {
    testEnvironment: "jsdom",
    moduleNameMapper: {
        "\\.(?:css|less)$":
            "<rootDir>/tests/mocks/style.js",
        "\\.(?:jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
            "<rootDir>/tests/mocks/file.js"
    },
    moduleFileExtensions: ["tsx", "ts", "jsx", "js"],
    transform: {
        "\\.jsx?$": "babel-jest",
        "\\.tsx?$": [
            "ts-jest", {
                tsconfig: "<rootDir>/tsconfig.test.json"
            }
        ]
    },
    setupFiles: [
        "<rootDir>/tests/mocks/browser.js"
    ],
    // needed by jsdom as they get lost somewhere in transformation
    globals: {
        TextEncoder,
        TextDecoder
    }
};