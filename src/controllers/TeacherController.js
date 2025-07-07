import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export class TeacherController {
  constructor(teacherService) {
    this.teacherService = teacherService;
  }

  getTeacherById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const teacher = await this.teacherService.getTeacherById(id);

      if (!teacher) {
        throw new ApiError(404, "Teacher not found");
      }

      return res.status(200).json(new ApiResponse(200, teacher));
    } catch (error) {
      next(error);
    }
  };

  getAllTeachers = async (req, res, next) => {
    try {
      const teachers = await this.teacherService.getAllTeachers();
      return res.status(200).json(new ApiResponse(200, teachers));
    } catch (error) {
      next(error);
    }
  };

  assignClassToStudent = async (req, res, next) => {
    try {
      const { classId, studentId } = req.body;

      if (!classId || !studentId) {
        throw new ApiError(400, "Class ID and Student ID are required");
      }

      const result = await this.teacherService.assignClassToStudent(
        classId,
        studentId
      );

      return res
        .status(200)
        .json(new ApiResponse(200, result, "Class assigned to student"));
    } catch (error) {
      next(error);
    }
  };

  getTeachersByClass = async (req, res, next) => {
    try {
      const { classId } = req.params;
      const teachers = await this.teacherService.getTeachersByClassId(classId);
      if (!teachers) {
        throw new ApiError(404, "Teachers not found");
      }
      return res.status(200).json(new ApiResponse(200, teachers));
    } catch (error) {
      next(error);
    }
  };

  updateStudentClassById = async (req, res, next) => {
    try {
      const { classId } = req.body;
      const { studentId } = req.params;

      const updatedData = await this.teacherService.updateStudentClass(
        studentId,
        classId
      );
      if (!updatedData) {
        throw new ApiError(404, "Class or Student  not found");
      }
      return res.status(200).json(new ApiResponse(200, updatedData));
    } catch (error) {
      next(error);
    }
  };
}
