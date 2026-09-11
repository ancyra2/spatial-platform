const target = process.env.API_PROXY_URL || 'http://127.0.0.1:3000';
module.exports = { '/api': { target, secure: true, changeOrigin: false } };
