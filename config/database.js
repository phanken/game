module.exports = {
    // Render/production: set MONGODB_URI in Environment.
    // Local development fallback is kept for compatibility.
    'url': process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017',
    'options': {
        'dbName': process.env.MONGODB_DB || 'trumclub0bot',
        'useNewUrlParser': true,
        'useUnifiedTopology': true,
    },
};
