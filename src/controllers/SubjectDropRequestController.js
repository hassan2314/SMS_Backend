import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export class SubjectDropRequestController {
  constructor(service) {
    this.service = service;
  }

  createRequest = async (req, res, next) => {
    try {
      if (req.user.role !== "TEACHER")
        throw new ApiError(403, "Only teachers can create drop requests");
      const { subjectId, reason } = req.body;
      const teacherId = req.user.id;

      if (!subjectId) throw new ApiError(400, "Subject ID is required");

      const result = await this.service.createRequest({
        subjectId,
        reason,
        teacherId,
      });

      return res
        .status(201)
        .json(new ApiResponse(201, result, "Drop request created"));
    } catch (err) {
      next(err);
    }
  };

  updateRequestStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["APPROVED", "REJECTED"].includes(status)) {
        throw new ApiError(400, "Invalid status value");
      }

      const updated = await this.service.updateRequestStatus(id, status);
      return res
        .status(200)
        .json(new ApiResponse(200, updated, "Request status updated"));
    } catch (err) {
      next(err);
    }
  };

  getAllRequests = async (req, res, next) => {
    try {
      const requests = await this.service.getAllRequests();
      return res.status(200).json(new ApiResponse(200, requests));
    } catch (err) {
      next(err);
    }
  };

  getRequestById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const request = await this.service.getRequestById(id);
      if (!request) throw new ApiError(404, "Request not found");

      return res.status(200).json(new ApiResponse(200, request));
    } catch (err) {
      next(err);
    }
  };

  getRequestsByTeacher = async (req, res, next) => {
    try {
      if (req.user.role !== "TEACHER")
        throw new ApiError(403, "Only teachers can get their requests");
      const teacherId = req.user.id;
      const requests = await this.service.getRequestsByTeacherId(teacherId);

      return res.status(200).json(new ApiResponse(200, requests));
    } catch (err) {
      next(err);
    }
  };
}
