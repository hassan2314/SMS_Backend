import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export class SubjectController {
  constructor(subjectService) {
    this.subjectService = subjectService;
  }

  createSubject = async (req, res, next) => {
    try {
      const { name, classId, teacherId } = req.body;

      if (!name || !classId || !teacherId) {
        throw new ApiError(400, "Name, classId, and teacherId are required");
      }

      const subject = await this.subjectService.createSubject({
        name,
        classId,
        teacherId,
      });

      if (!subject) {
        throw new ApiError(404, "Class or Teacher not found");
      }

      return res
        .status(201)
        .json(new ApiResponse(201, subject, "Subject created successfully"));
    } catch (error) {
      next(error);
    }
  };

  getAllSubjects = async (req, res, next) => {
    try {
      const subjects = await this.subjectService.getAllSubjects();
      return res.status(200).json(new ApiResponse(200, subjects));
    } catch (error) {
      next(error);
    }
  };

  getSubjectById = async (req, res, next) => {
    try {
      const { id } = req.params;

      const subject = await this.subjectService.getSubjectById(id);
      if (!subject) {
        throw new ApiError(404, "Subject not found");
      }

      return res.status(200).json(new ApiResponse(200, subject));
    } catch (error) {
      next(error);
    }
  };

  getSubjectsByClassId = async (req, res, next) => {
    try {
      const { classId } = req.params;

      const subjects = await this.subjectService.getSubjectsByClassId(classId);
      return res.status(200).json(new ApiResponse(200, subjects));
    } catch (error) {
      next(error);
    }
  };

  getSubjectsByTeacherId = async (req, res, next) => {
    try {
      const { teacherId } = req.params;

      const data = await this.subjectService.getSubjectsByTeacherId(teacherId);

      if (!data || data.subjects.length === 0) {
        throw new ApiError(404, "No subjects found for this teacher");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, data, "Subjects fetched"));
    } catch (error) {
      next(error);
    }
  };

  updateSubject = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const updated = await this.subjectService.updateSubject(id, data);
      if (!updated) {
        throw new ApiError(404, "Subject not found");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, updated, "Subject updated"));
    } catch (error) {
      next(error);
    }
  };

  deleteSubject = async (req, res, next) => {
    try {
      const { id } = req.params;

      const deleted = await this.subjectService.deleteSubject(id);
      if (!deleted) {
        throw new ApiError(404, "Subject not found");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, deleted, "Subject deleted"));
    } catch (error) {
      next(error);
    }
  };
}
