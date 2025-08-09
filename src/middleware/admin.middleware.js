function adminOnly(req, res, next) {
  if (req.user.role !== "ADMIN") {
    console.log(req.user.role);
    return res
      .status(403)
      .json({ message: "Only admins can access this route" });
  }
  next();
}

export { adminOnly };
