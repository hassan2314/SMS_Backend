import prisma from "../db/index.js";

export class AssignmentService {
  async createAssignment(data) {
    return await prisma.assignment.create({ data });
  }

  async getAssignmentsByClass(classId) {
    return await prisma.assignment.findMany({
      where: { classId },
      orderBy: { dueDate: "asc" },
      include: {
        subject: { select: { name: true } },
        teacher: { include: { user: { select: { name: true } } } },
      },
    });
  }

  async getAssignmentsBySubject(subjectId) {
    return await prisma.assignment.findMany({
      where: { subjectId },
      orderBy: { dueDate: "asc" },
    });
  }

  async getAssignmentsByTeacher(teacherId) {
    return await prisma.assignment.findMany({
      where: { teacherId },
      orderBy: { dueDate: "asc" },
    });
  }

  async deleteAssignment(id) {
    return await prisma.assignment.delete({
      where: { id },
    });
  }
}
