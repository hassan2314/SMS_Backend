import prisma from "../db/index.js";

export class StudentService {
  async getStudentById(id) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            subjects: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async getAllStudents() {
    return await prisma.student.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
