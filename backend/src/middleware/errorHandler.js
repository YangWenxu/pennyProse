const errorHandler = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    // Log error
    console.error('Error:', err)

    // Set status code
    ctx.status = err.status || err.statusCode || 500

    // Set error response
    ctx.body = {
      error: {
        message: err.message || 'Internal Server Error',
        status: ctx.status,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      }
    }

    // Emit error event for logging
    ctx.app.emit('error', err, ctx)
  }
}

export default errorHandler
