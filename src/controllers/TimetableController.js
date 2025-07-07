import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export class TimetableController {
  constructor(timetableService) {
    this.timetableService = timetableService;
  }

  createTimetable = async (req, res, next) => {
    try {
      const { subjectId, classId, teacherId, day, time } = req.body;

      if (!subjectId || !classId || !teacherId || !day || !time) {
        throw new ApiError(400, "All fields are required");
      }

      const newEntry = await this.timetableService.create({
        subjectId,
        classId,
        teacherId,
        day,
        time,
      });

      if (!newEntry) {
        throw new ApiError(404, "Class or Teacher not found");
      }

      return res
        .status(201)
        .json(new ApiResponse(201, newEntry, "Timetable entry created"));
    } catch (error) {
      next(error);
    }
  };

  getAllTimetables = async (req, res, next) => {
    try {
      const data = await this.timetableService.getAll();
      if (!data) {
        throw new ApiError(404, "Timetable entry not found");
      }
      return res.status(200).json(new ApiResponse(200, data));
    } catch (error) {
      next(error);
    }
  };

  getTimetableByClass = async (req, res, next) => {
    try {
      const { classId } = req.params;
      const data = await this.timetableService.getByClassId(classId);
      if (!data) {
        throw new ApiError(404, "Timetable entry not found");
      }
      return res.status(200).json(new ApiResponse(200, data));
    } catch (error) {
      next(error);
    }
  };

  getTimetableByTeacher = async (req, res, next) => {
    try {
      const { teacherId } = req.params;
      const data = await this.timetableService.getByTeacherId(teacherId);
      if (!data) {
        throw new ApiError(404, "Timetable entry not found");
      }
      return res.status(200).json(new ApiResponse(200, data));
    } catch (error) {
      next(error);
    }
  };

  deleteTimetable = async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await this.timetableService.delete(id);
      if (!deleted) {
        throw new ApiError(404, "Timetable entry not found");
      }
      return res
        .status(200)
        .json(new ApiResponse(200, deleted, "Timetable entry deleted"));
    } catch (error) {
      next(error);
    }
  };

  updateTimetable = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await this.timetableService.update(id, req.body);
      if (!updated) {
        throw new ApiError(404, "Timetable entry not found");
      }
      return res
        .status(200)
        .json(new ApiResponse(200, updated, "Timetable entry updated"));
    } catch (error) {
      next(error);
    }
  };

  getTimetableByStudentId = async (req, res, next) => {
    try {
      const { studentId } = req.params;
      const data = await this.timetableService.getByStudentId(studentId);
      return res.status(200).json(new ApiResponse(200, data));
    } catch (error) {
      next(error);
    }
  };

  getTimetableByDay = async (req, res, next) => {
    try {
      const { day } = req.query;
      if (!day) {
        throw new ApiError(400, "Day is required in query");
      }

      const timetable = await this.timetableService.getTimetableByDay(day);
      return res.status(200).json(new ApiResponse(200, timetable));
    } catch (error) {
      next(error);
    }
  };
}
