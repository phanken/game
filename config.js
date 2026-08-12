module.exports = {
    // Never commit the production JWT secret to GitHub.
    secret: process.env.JWT_SECRET || 'CHANGE_ME_IN_RENDER'
};
