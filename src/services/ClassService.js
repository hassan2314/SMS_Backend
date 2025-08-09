import prisma from "../db/index.js";

export class ClassService {
  async createClass(data) {
    return await prisma.class.create({ data });
  }

  async getAllClasses() {
    return await prisma.class.findMany({
      include: {
        students: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async getClassById(id) {
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        subjects: {
          select: {
            id: true,
            name: true,
          },
        },

        students: {
          select: {
            id: true,
          },
        },
      },
    });

    return {
      id: classData.id,
      name: classData.name,
      subjects: classData.subjects,
      studentCount: classData.students.length,
    };
  }

  async deleteClass(id) {
    return await prisma.class.delete({ where: { id } });
  }

  async updateClass(id, data) {
    return await prisma.class.update({ where: { id }, data });
  }
}
