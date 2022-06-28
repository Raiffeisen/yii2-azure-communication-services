const path = require('path');

module.exports = {
    entry: {
        'teams-client': './src/assets/dist/teams-client.js'
    },
    resolve: {
        extensions: ['.js']
    },
    output: {
        filename: '[name].min.js',
        library: {
            name: 'TeamsClient',
            type: 'window',
            export: 'default'
        },
        path: path.resolve(__dirname, 'src/assets/dist')
    },
};
