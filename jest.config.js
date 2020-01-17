module.exports = {
    "testEnvironment": "node",
    "coverageDirectory": "coverage",
    "collectCoverage": true,
    "collectCoverageFrom": [
        'src/**/*.js',
        '!src/lib/insert-css.js'
    ]
}