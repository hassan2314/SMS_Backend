import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export class MonthlyResultController {
  constructor(monthlyResultService) {
    this.monthlyResultService = monthlyResultService;
  }

  addResult = async (req, res, next) => {
    try {
      const { studentId, subjectId, month, marks, totalMarks, remarks } =
        req.body;

      const result = await this.monthlyResultService.addResult({
        studentId,
        subjectId,
        month,
        marks,
        totalMarks,
        remarks,
      });

      if (!result) {
        throw new ApiError(404, "Student or Subject not found");
      }

      return res.status(201).json(new ApiResponse(201, result, "Result added"));
    } catch (error) {
      next(error);
    }
  };

  getStudentResults = async (req, res, next) => {
    try {
      const { studentId } = req.params;
      const results = await this.monthlyResultService.getResultsByStudent(
        studentId
      );
      if (!results) {
        throw new ApiError(404, "Results not found");
      }
      return res.status(200).json(new ApiResponse(200, results));
    } catch (error) {
      next(error);
    }
  };

  getResultsByMonth = async (req, res, next) => {
    try {
      const { month } = req.params;
      const results = await this.monthlyResultService.getResultsByMonth(month);
      if (!results) {
        throw new ApiError(404, "Results not found");
      }
      return res.status(200).json(new ApiResponse(200, results));
    } catch (error) {
      next(error);
    }
  };

  updateResult = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await this.service.updateResult(id, req.body);
      return res
        .status(200)
        .json(new ApiResponse(200, result, "Result updated"));
    } catch (err) {
      next(err);
    }
  };

  getResultsByClass = async (req, res, next) => {
    try {
      const { classId } = req.params;
      const results = await this.monthlyResultService.getResultsByClass(
        classId
      );
      if (!results) {
        throw new ApiError(404, "Results not found");
      }
      return res.status(200).json(new ApiResponse(200, results));
    } catch (error) {
      next(error);
    }
  };
}
