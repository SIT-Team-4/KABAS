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
    const status = err.status || 500;
    const isProduction = process.env.NODE_ENV === 'production';
    const message = status >= 500 && isProduction
        ? 'Internal Server Error'
        : (err.message || 'Internal Server Error');

    res.status(err.status || 500).json({
        error: message,
    });
};

export default errorHandler;
