/**
 * Global Express error-handling middleware.
 * Logs the stack trace and responds with the error status and message.
 * @param {Error} err - The error object.
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} _next - Express next (unused).
 */
const errorHandler = (err, req, res, _next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
};

export default errorHandler;
