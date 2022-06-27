const path = require('path');

module.exports = {
    entry: './src/assets/js/teams-client.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: '/node_modules/'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: 'teams-client.min.js',
        path: path.resolve(__dirname, 'src/assets/dist')
    },
};
