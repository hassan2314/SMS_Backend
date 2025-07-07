import prisma from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";

export class AssignmentSubmissionService {
  async submitAssignment(data) {
    const { assignmentId, studentId, fileUrl } = data;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new ApiError(404, "Assignment not found");
    }

    const now = new Date();
    if (now > assignment.dueDate) {
      throw new ApiError(400, "Submission deadline has passed");
    }

    return prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: { assignmentId, studentId },
      },
      update: {
        fileUrl,
        submittedAt: now,
      },
      create: {
        assignmentId,
        studentId,
        fileUrl,
        submittedAt: now,
      },
    });
  }

  async getSubmissionsByAssignment(assignmentId) {
    return prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: { student: true },
    });
  }

  async getSubmissionsByStudent(studentId) {
    return prisma.assignmentSubmission.findMany({
      where: { studentId },
      include: { assignment: true },
    });
  }

  async gradeSubmission(submissionId, grade, remarks) {
    return prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: { grade, remarks },
    });
  }
}
