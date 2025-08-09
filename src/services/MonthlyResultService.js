import prisma from "../db/index.js";

export class MonthlyResultService {
  async addResult(data) {
    return await prisma.monthlyResult.create({ data });
  }

  async updateResult(id, data) {
    return prisma.monthlyResult.update({
      where: { id },
      data,
    });
  }

  async getResultsByStudent(studentId) {
    return await prisma.monthlyResult.findMany({
      where: { studentId },
      include: {
        subject: {
          select: { name: true },
        },
        student: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });
  }

  async getResultsByMonth(month) {
    return await prisma.monthlyResult.findMany({
      where: { month },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
          },
        },
        subject: {
          select: { name: true },
        },
      },
    });
  }

  async getResultsByClass(classId) {
    return await prisma.monthlyResult.findMany({
      where: { classId },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
          },
        },
        subject: {
          select: { name: true },
        },
      },
    });
  }
}
