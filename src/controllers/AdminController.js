import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export class AdminController {
  constructor(adminService) {
    this.adminService = adminService;
  }

  getAllUsers = async (req, res, next) => {
    try {
      const users = await this.adminService.getAllUsers();
      return res
        .status(200)
        .json(new ApiResponse(200, users, "All users fetched"));
    } catch (err) {
      next(err);
    }
  };

  deleteUserById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await this.adminService.deleteUserById(id);
      return res.status(200).json(new ApiResponse(200, user, "User deleted"));
    } catch (err) {
      next(err);
    }
  };

  updateUserRole = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!["ADMIN", "TEACHER", "STUDENT"].includes(role)) {
        throw new ApiError(400, "Invalid role");
      }

      const updatedUser = await this.adminService.updateUserRole(id, role);
      return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Role updated"));
    } catch (err) {
      next(err);
    }
  };

  getUserById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await this.adminService.getUserById(id);
      return res.status(200).json(new ApiResponse(200, user));
    } catch (err) {
      next(err);
    }
  };
  getUserStatsByRole = async (req, res, next) => {
    try {
      const stats = await this.adminService.getUserStatsByRole();
      return res
        .status(200)
        .json(new ApiResponse(200, stats, "User stats by role"));
    } catch (err) {
      next(err);
    }
  };

  getOverviewStats = async (req, res, next) => {
    try {
      const data = await this.adminService.getStudentTeacherCounts();
      return res.status(200).json(new ApiResponse(200, data, "Overview stats"));
    } catch (err) {
      next(err);
    }
  };

  getAssignmentStats = async (req, res, next) => {
    try {
      const count = await this.adminService.getAssignmentStats();
      return res
        .status(200)
        .json(new ApiResponse(200, count, "Assignment count"));
    } catch (err) {
      next(err);
    }
  };

  getAttendanceSummary = async (req, res, next) => {
    try {
      const summary = await this.adminService.getAttendanceSummary();
      return res
        .status(200)
        .json(new ApiResponse(200, summary, "Attendance summary"));
    } catch (err) {
      next(err);
    }
  };

  getMonthlyResultStats = async (req, res, next) => {
    try {
      const stats = await this.adminService.getMonthlyResultStats();
      return res
        .status(200)
        .json(new ApiResponse(200, stats, "Monthly result stats"));
    } catch (err) {
      next(err);
    }
  };
}
