function adminOrTecherOnly(req, res, next) {
  if (req.user.role !== "ADMIN" && req.user.role !== "TEACHER") {
    console.log(req.user.role);
    return res
      .status(403)
      .json({ message: "Only Admins or Teachers can access this route" });
  }
  next();
}

export { adminOrTecherOnly };
