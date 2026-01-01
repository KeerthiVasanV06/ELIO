const errorMiddleware = (err, req, res, next) => {
  console.error("ERROR MESSAGE:", err.message);
  console.error("ERROR STACK:", err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorMiddleware;
