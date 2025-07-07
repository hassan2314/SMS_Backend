import prisma from "../db/index.js";

export class SubjectDropRequestService {
  async createRequest(data) {
    return await prisma.subjectDropRequest.create({ data });
  }

  async getAllRequests() {
    return await prisma.subjectDropRequest.findMany({
      include: {
        subject: {
          select: { name: true },
        },
        teacher: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });
  }

  async getRequestById(id) {
    return await prisma.subjectDropRequest.findUnique({
      where: { id },
      include: {
        subject: true,
        teacher: {
          include: { user: true },
        },
      },
    });
  }

  async updateRequestStatus(id, status) {
    return await prisma.subjectDropRequest.update({
      where: { id },
      data: { status },
    });
  }

  async getRequestsByTeacherId(teacherId) {
    return await prisma.subjectDropRequest.findMany({
      where: { teacherId },
      include: {
        subject: true,
      },
    });
  }
}
