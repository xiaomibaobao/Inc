var webpack = require('webpack');

module.exports = {
    entry: './inc.js',
    output: {
        filename: 'inc.js',
        path: './dist'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({minimize: true})
    ]
};
