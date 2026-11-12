const path = require('path');

module.exports = {
    entry: {
        bundle: './js/app.js',
        // Native seam for the Android (Capacitor) build; loaded only by
        // www/index.html, which tools/build-www.mjs assembles.
        'capacitor-bridge': './js/capacitor-bridge.js',
    },
    output: {
        filename: '[name].js',
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
