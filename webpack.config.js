var webpack = require('webpack');

module.exports = {
    entry: './inc.js',
    output: {
        filename: 'inc.js',
        path: './dist'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel',
            exclude: /node_modules/
        }]
    },
    babel: {
        presets: ['es2015-loose'],
        plugins: [
            'transform-object-assign',
            'transform-object-rest-spread'
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({minimize: true})
    ]
};
