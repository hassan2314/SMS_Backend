import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export class StudentController {
  constructor(studentService) {
    this.studentService = studentService;
  }

  getStudentById = async (req, res, next) => {
    try {
      const { id } = req.params;

      const requester = req.user;

      if (
        requester.role !== "ADMIN" &&
        requester.role !== "TEACHER" &&
        requester.id !== id
      ) {
        throw new ApiError(403, "Not authorized to access this student's data");
      }

      const student = await this.studentService.getStudentById(id);

      if (!student) {
        throw new ApiError(404, "Student not found");
      }

      return res.status(200).json(new ApiResponse(200, student));
    } catch (err) {
      next(err);
    }
  };

  getAllStudents = async (req, res, next) => {
    try {
      const students = await this.studentService.getAllStudents();
      if (!students) {
        throw new ApiError(404, "No students found");
      }
      return res.status(200).json(new ApiResponse(200, students));
    } catch (err) {
      next(err);
    }
  };
}
