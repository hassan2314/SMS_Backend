import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function refreshCookieBase() {
  const crossSite = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: crossSite,
    sameSite: crossSite ? "none" : "lax",
    path: "/",
  };
}

function refreshCookieOptions() {
  return { ...refreshCookieBase(), maxAge: REFRESH_MAX_AGE_MS };
}

function publicUser(user) {
  if (!user) return user;
  const { password, refreshToken, ...safe } = user;
  return safe;
}

export class UserController {
  constructor(userService) {
    this.userService = userService;
  }
  generateAccessToken = (user) => {
    return jwt.sign(
      { id: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
  };

  generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });
  };

  updateRefreshToken = async (user, res) => {
    try {
      const newRefreshToken = this.generateRefreshToken(user);

      await this.userService.updateUser(user.id, {
        refreshToken: newRefreshToken,
      });

      res.cookie("refreshToken", newRefreshToken, refreshCookieOptions());

      return newRefreshToken;
    } catch (err) {
      throw new ApiError(500, "Failed to update refresh token");
    }
  };

  refreshAccessToken = async (req, res) => {
    try {
      const token = req.cookies?.refreshToken;
      if (!token) {
        throw new ApiError(401, "Refresh token not found");
      }

      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

      const user = await this.userService.findAuthById(decoded.id);
      if (!user || user.refreshToken !== token) {
        throw new ApiError(403, "Invalid refresh token");
      }

      const accessToken = this.generateAccessToken(user);

      // Remove sensitive data (e.g. password, refreshToken) before sending user
      const { password, refreshToken, ...safeUser } = user;

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            accessToken,
            user: safeUser, // ✅ include user in response
          },
          "Access token refreshed"
        )
      );
    } catch (error) {
      return res
        .status(401)
        .json(
          new ApiError(401, error.message || "Invalid or expired refresh token")
        );
    }
  };

  createUser = async (req, res) => {
    try {
      const data = req.body;
      if (!["TEACHER", "STUDENT"].includes(data.role)) {
        return res
          .status(400)
          .json(new ApiError(400, "Role must be TEACHER or STUDENT"));
      }

      const existUser = await this.userService.findByEmail(data.email);
      if (existUser) {
        return res.status(400).json(new ApiError(400, "User already exists"));
      }

      data.dob = new Date(data.dob);
      data.password = await bcrypt.hash(data.password, 10);

      const user = await this.userService.create(data);
      if (!user) {
        return res.status(400).json(new ApiError(400, "User not created"));
      }

      const accessToken = this.generateAccessToken(user);
      await this.updateRefreshToken(user, res);

      return res.status(201).json(
        new ApiResponse(
          201,
          { accessToken, user: publicUser(user) },
          "User created successfully"
        )
      );
    } catch (error) {
      return res.status(500).json(new ApiError(500, error.message));
    }
  };

  loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid password");
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.updateRefreshToken(user, res);

    if (!accessToken) {
      throw new ApiError(500, "Failed to generate access token");
    }

    if (!refreshToken) {
      throw new ApiError(500, "Failed to generate refresh token");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        { accessToken, user: publicUser(user) },
        "Login successful"
      )
    );
  };

  logoutUser = async (req, res) => {
    try {
      console.log("user id ", req.user.id);
      await this.userService.updateUser(req.user.id, { refreshToken: null });
      res.clearCookie("refreshToken", refreshCookieBase());

      return res
        .status(200)
        .json(new ApiResponse(200, null, "Logout successful"));
    } catch (error) {
      return res.status(500).json(new ApiError(500, error.message));
    }
  };

  changePassword = async (req, res) => {
    try {
      const { id } = req.user;
      const { previousPassword, password } = req.body;

      const user = await this.userService.findAuthById(id);
      const isPasswordValid = await bcrypt.compare(
        previousPassword,
        user.password
      );
      if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.userService.changePassword(id, hashedPassword);
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Password changed successfully"));
    } catch (error) {
      return res.status(500).json(new ApiError(500, error.message));
    }
  };

  deleteUser = async (req, res) => {
    try {
      const { id } = req.user;
      const deletedUser = await this.userService.deleteUser(id);
      if (!deletedUser) {
        return res.status(404).json(new ApiError(404, "User not found"));
      }
      res.clearCookie("refreshToken", refreshCookieBase());
      return res
        .status(200)
        .json(new ApiResponse(200, publicUser(deletedUser), "User deleted successfully"));
    } catch (error) {
      return res.status(500).json(new ApiError(500, error.message));
    }
  };

  deleteByAdmin = async (req, res) => {
    try {
      if (req.user.role !== "ADMIN") {
        return res
          .status(403)
          .json(
            new ApiError(403, "You are not authorized to perform this action")
          );
      }
      const { id } = req.params;
      const deletedUser = await this.userService.deleteUser(id);
      if (!deletedUser) {
        return res.status(404).json(new ApiError(404, "User not found"));
      }
      return res
        .status(200)
        .json(
          new ApiResponse(200, publicUser(deletedUser), "User deleted successfully")
        );
    } catch (error) {
      return res.status(500).json(new ApiError(500, error.message));
    }
  };

  updateUser = async (req, res) => {
    try {
      const { id } = req.user;
      const { name, dob } = req.body;
      const updatedUser = await this.userService.updateUser(id, { name, dob });
      if (!updatedUser) {
        return res.status(404).json(new ApiError(404, "User not found"));
      }
      return res
        .status(200)
        .json(
          new ApiResponse(200, publicUser(updatedUser), "User updated successfully")
        );
    } catch (error) {
      return res.status(500).json(new ApiError(500, error.message));
    }
  };

  getUsers = async (req, res) => {
    try {
      if (req.user.role !== "ADMIN") {
        return res
          .status(403)
          .json(
            new ApiError(403, "You are not authorized to perform this action")
          );
      }
      const users = await this.userService.findAll();
      return res
        .status(200)
        .json(new ApiResponse(200, users, "Users fetched successfully"));
    } catch (error) {
      return res.status(500).json(new ApiError(500, error.message));
    }
  };

  getUserById = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);
      console.log(id);
      if (!user) {
        return res.status(404).json(new ApiError(404, "User not found"));
      }

      return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched successfully"));
    } catch (error) {
      return res.status(500).json(new ApiError(500, error.message));
    }
  };
}
