function errorMiddleware(err, req, res, next) {
    console.error(err);
    if (res.headersSent) {
        return next(err);
    }
    return res.status(500).json({
        success: false,
        message: err && err.message ? err.message : 'Server error'
    });
}

module.exports = errorMiddleware;
