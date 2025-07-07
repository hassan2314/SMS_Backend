import prisma from "../db/index.js";

export class TimetableService {
  async create(data) {
    return await prisma.timetable.create({ data });
  }

  async getAll() {
    return await prisma.timetable.findMany({
      include: {
        subject: { select: { name: true } },
        class: { select: { id: true, name: true } },
        teacher: {
          include: { user: { select: { name: true } } },
        },
      },
    });
  }

  async getByClassId(classId) {
    return await prisma.timetable.findMany({
      where: { classId },
      include: {
        subject: { select: { name: true } },
        teacher: {
          include: { user: { select: { name: true } } },
        },
      },
    });
  }

  async getByTeacherId(teacherId) {
    return await prisma.timetable.findMany({
      where: { teacherId },
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
      },
    });
  }

  async delete(id) {
    return await prisma.timetable.delete({ where: { id } });
  }

  async update(id, data) {
    return await prisma.timetable.update({ where: { id }, data });
  }
  async getByStudentId(studentId) {
    // classId from student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { classId: true },
    });

    if (!student || !student.classId) return [];

    // timetable for student classId
    return await prisma.timetable.findMany({
      where: { classId: student.classId },
      include: {
        subject: { select: { name: true } },
        teacher: {
          include: { user: { select: { name: true } } },
        },
      },
    });
  }
  async getTimetableByDay(day) {
    return await prisma.timetable.findMany({
      where: { day },
      orderBy: { startTime: "asc" },
      include: {
        class: { select: { id: true, name: true } },
        subject: { select: { name: true } },
        teacher: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });
  }
}
