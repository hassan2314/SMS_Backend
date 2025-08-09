import prisma from "../db/index.js";

export class TeacherService {
  async create(data) {
    return await prisma.teacher.create({ data });
  }

  async getTeacherById(id) {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        subjects: {
          select: {
            name: true,
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      return null;
    }

    // duplicate not allow
    const classesMap = {};
    teacher.subjects.forEach((subj) => {
      if (subj.class && !classesMap[subj.class.id]) {
        classesMap[subj.class.id] = subj.class;
      }
    });

    return {
      name: teacher.user.name,
      email: teacher.user.email,
      subjects: teacher.subjects.map((subj) => ({
        subjectName: subj.name,
        className: subj.class?.name,
      })),
      classes: Object.values(classesMap),
    };
  }

  async getAllTeachers() {
    return await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        subjects: {
          select: {
            name: true,
            class: {
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

  async getUserIdByTeacherId(id) {
    return await prisma.teacher.findUnique({
      where: { id },
      select: {
        userId: true,
      },
    });
  }

  async assignClassToStudent(classId, studentId) {
    return await prisma.class.update({
      where: { id: classId },
      data: {
        students: {
          connect: { id: studentId },
        },
      },
    });
  }

  async getTeachersByClassId(classId) {
    return await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        subjects: {
          select: {
            name: true,
            class: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async updateStudentClass(studentId, classId) {
    return await prisma.student.update({
      where: { id: studentId },
      data: {
        classId,
      },
    });
  }
}
