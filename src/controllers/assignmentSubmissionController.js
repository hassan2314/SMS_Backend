import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export class AssignmentSubmissionController {
  constructor(assignmentSubmissionService) {
    this.assignmentSubmissionService = assignmentSubmissionService;
  }

  submitAssignment = async (req, res) => {
    try {
      const submission =
        await this.assignmentSubmissionService.submitAssignment(req.body);
      if (!submission) {
        throw new ApiError(404, "Assignment not found");
      }
      res.status(200).json(new ApiResponse(200, submission));
    } catch (error) {
      throw new ApiError(500, error.message);
    }
  };

  getAssignmentSubmissions = async (req, res) => {
    try {
      const submissions =
        await this.assignmentSubmissionService.getSubmissionsByAssignment(
          req.params.assignmentId
        );
      res.status(200).json(new ApiResponse(200, submissions));
    } catch (error) {
      throw new ApiError(500, error.message);
    }
  };

  getStudentSubmissions = async (req, res) => {
    try {
      const submissions =
        await this.assignmentSubmissionService.getSubmissionsByStudent(
          req.params.studentId
        );
      res.status(200).json(new ApiResponse(200, submissions));
    } catch (error) {
      throw new ApiError(500, error.message);
    }
  };

  gradeSubmission = async (req, res) => {
    try {
      const { grade, remarks } = req.body;
      const { submissionId } = req.params;
      const result = await this.assignmentSubmissionService.gradeSubmission(
        submissionId,
        grade,
        remarks
      );
      res.status(200).json(new ApiResponse(200, result));
    } catch (error) {
      throw new ApiError(500, error.message);
    }
  };
}
