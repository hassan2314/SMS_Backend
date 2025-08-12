import prisma from "../db/index.js";

export class SubjectService {
  async createSubject(data) {
    const { name, classId, teacherId } = data;

    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });
    const teacherExists = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!classExists || !teacherExists) return null;

    return await prisma.subject.create({
      data: {
        name,
        classId,
        teacherId,
      },
    });
  }

  async getAllSubjects() {
    return await prisma.subject.findMany({
      include: {
        class: { select: { id: true, name: true } },
        teacher: {
          include: {
            user: { select: { email: true, name: true } },
          },
        },
      },
    });
  }

  async getSubjectsByClassId(classId) {
    return await prisma.subject.findMany({
      where: { classId },
      include: {
        teacher: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async getSubjectsByTeacherId(teacherId) {
    const subjects = await prisma.subject.findMany({
      where: { teacherId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      subjects,
      classCount: new Set(subjects.map((s) => s.class?.id)).size,
    };
  }

  async updateSubject(id, data) {
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) return null;

    return await prisma.subject.update({
      where: { id },
      data,
    });
  }

  async deleteSubject(id) {
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) return null;

    return await prisma.subject.delete({ where: { id } });
  }

  async getSubjectById(id) {
    if (!id) return null;

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        class: { select: { id: true, name: true } },
        teacher: {
          select: {
            id: true,
            user: { select: { name: true } },
          },
        },
      },
    });

    return subject;
  }
}
