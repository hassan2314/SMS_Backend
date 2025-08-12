import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export class AttendanceController {
  constructor(attendanceService) {
    this.attendanceService = attendanceService;
  }

  markAttendance = async (req, res, next) => {
    try {
      const { studentId, subjectId, date, status } = req.body;
      if (!studentId || !subjectId || !date || !status) {
        throw new ApiError(400, "Missing required fields");
      }

      const attendance = await this.attendanceService.markAttendance({
        studentId,
        subjectId,
        date: new Date(date),
        status,
      });

      if (!attendance) {
        throw new ApiError(404, "Student or Subject not found");
      }

      return res
        .status(201)
        .json(new ApiResponse(201, attendance, "Attendance marked"));
    } catch (err) {
      next(err);
    }
  };

  getStudentAttendance = async (req, res, next) => {
    try {
      const { studentId } = req.params;
      const attendance = await this.attendanceService.getAttendanceByStudent(
        studentId
      );

      if (!attendance) {
        throw new ApiError(404, "Student not found");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, attendance, "Attendance fetched"));
    } catch (err) {
      next(err);
    }
  };

  getClassAttendance = async (req, res, next) => {
    try {
      const { classId } = req.params;
      const { date } = req.query;

      const attendance = await this.attendanceService.getAttendanceByClass(
        classId,
        new Date(date)
      );

      if (!attendance) {
        throw new ApiError(404, "Class not found");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, attendance, "Class attendance fetched"));
    } catch (err) {
      next(err);
    }
  };

  getAttendancePercentageBySubject = async (req, res) => {
    try {
      const data =
        await this.attendanceService.getAttendancePercentageBySubject();
      res.status(200).json(new ApiResponse(200, data));
    } catch (error) {
      throw new ApiError(500, error.message);
    }
  };

  getAttendancePercentageOfUser = async (req, res) => {
    try {
      const studentId = req.params.id;
      console.log(studentId);
      const data = await this.attendanceService.getAttendancePercentageByUser(
        studentId
      );
      console.log(data);
      res.status(200).json(new ApiResponse(200, data));
    } catch (error) {
      console.log(error);
      res.status(500).json(new ApiError(500, error.message));
    }
  };

  getAttendancePercentageByStudent = async (req, res) => {
    try {
      const userId = req.params.id;
      console.log(userId);
      const data =
        await this.attendanceService.getAttendancePercentageByStudent(userId);
      res.status(200).json(new ApiResponse(200, data));
    } catch (error) {
      res.status(500).json(new ApiError(500, error.message));
    }
  };
}
