import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export class AssignmentController {
  constructor(assignmentService) {
    this.assignmentService = assignmentService;
  }

  create = async (req, res, next) => {
    try {
      const { title, description, dueDate, classId, subjectId, teacherId } =
        req.body;

      if (!title || !dueDate || !classId || !subjectId || !teacherId) {
        throw new ApiError(400, "Missing required fields");
      }

      const assignment = await this.assignmentService.createAssignment({
        title,
        description,
        dueDate: new Date(dueDate),
        classId,
        subjectId,
        teacherId,
      });

      return res
        .status(201)
        .json(new ApiResponse(201, assignment, "Assignment created"));
    } catch (err) {
      next(err);
    }
  };

  getByClass = async (req, res, next) => {
    try {
      const { classId } = req.params;
      const data = await this.assignmentService.getAssignmentsByClass(classId);
      return res.status(200).json(new ApiResponse(200, data));
    } catch (err) {
      next(err);
    }
  };

  getBySubject = async (req, res, next) => {
    try {
      const { subjectId } = req.params;
      const data = await this.assignmentService.getAssignmentsBySubject(
        subjectId
      );
      return res.status(200).json(new ApiResponse(200, data));
    } catch (err) {
      next(err);
    }
  };

  getByTeacher = async (req, res, next) => {
    try {
      const { teacherId } = req.params;
      const data = await this.assignmentService.getAssignmentsByTeacher(
        teacherId
      );
      return res.status(200).json(new ApiResponse(200, data));
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await this.assignmentService.deleteAssignment(id);
      return res.status(200).json(new ApiResponse(200, deleted, "Deleted"));
    } catch (err) {
      next(err);
    }
  };
}
