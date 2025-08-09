import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

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

      const user = await this.userService.findById(decoded.id);
      if (!user || user.refreshToken !== token) {
        throw new ApiError(403, "Invalid refresh token");
      }

      const accessToken = this.generateAccessToken(user);

      return res
        .status(200)
        .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
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
      const dob = new Date(data.dob);
      data.dob = dob;
      const hashedPassword = await bcrypt.hash(data.password, 10);
      data.password = hashedPassword;

      const existUser = await this.userService.findByEmail(data.email);
      if (existUser) {
        return res.status(400).json(new ApiError(400, "User already exists"));
      }

      const user = await this.userService.create(data);
      if (!user) {
        return res.status(400).json(new ApiError(400, "User not created"));
      }

      return res
        .status(201)
        .json(new ApiResponse(201, user, "User created successfully"));
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

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { accessToken }, "Login successful"));
  };

  logoutUser = async (req, res) => {
    try {
      console.log("user id ", req.user.id);
      await this.userService.updateUser(req.user.id, { refreshToken: null });
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
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

      const user = await this.userService.findById(id);
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

  async deleteUser(req, res) {
    try {
      const { id } = req.user;
      const deletedUser = await this.userService.deleteUser(id);
      if (!deletedUser) {
        return res.status(404).json(new ApiError(404, "User not found"));
      }
      res.clearCookie("refreshToken");
      return res
        .status(200)
        .json(new ApiResponse(200, deletedUser, "User deleted successfully"));
    } catch (error) {
      return res.status(500).json(new ApiError(500, error.message));
    }
  }

  async deleteByAdmin(req, res) {
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
        .json(new ApiResponse(200, deletedUser, "User deleted successfully"));
    } catch (error) {
      return res.status(500).json(new ApiError(500, error.message));
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.user;
      const { name, dob } = req.body;
      const updatedUser = await this.userService.updateUser(id, { name, dob });
      if (!updatedUser) {
        return res.status(404).json(new ApiError(404, "User not found"));
      }
      return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "User updated successfully"));
    } catch (error) {
      return res.status(500).json(new ApiError(500, error.message));
    }
  }

  async getUsers(req, res) {
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
  }

  async getUser(req, res) {
    try {
      const { id } = req.user;
      const user = await this.userService.findById(id);
      if (!user) {
        return res.status(404).json(new ApiError(404, "User not found"));
      }
      return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched successfully"));
    } catch (error) {
      return res.status(500).json(new ApiError(500, error.message));
    }
  }
}
