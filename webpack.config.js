const path = require('path');

module.exports = {
    entry: './js/app.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'production',
    resolve: {
        extensions: ['.js'],
    },
    devtool: 'source-map',
    performance: {
        maxAssetSize: 1024 * 1024,
        maxEntrypointSize: 1024 * 1024,
    },
};
