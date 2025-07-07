import prisma from "../db/index.js";

export class AttendanceService {
  async markAttendance({ studentId, subjectId, date, status }) {
    return await prisma.attendance.create({
      data: { studentId, subjectId, date, status },
    });
  }

  async getAttendanceByStudent(studentId) {
    return await prisma.attendance.findMany({
      where: { studentId },
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });
  }

  async getAttendanceByClass(classId, date) {
    return await prisma.attendance.findMany({
      where: {
        date,
        subject: {
          classId,
        },
      },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
          },
        },
        subject: { select: { name: true } },
      },
    });
  }

  async getAttendancePercentageBySubject() {
    const subjects = await prisma.subject.findMany({
      include: {
        class: {
          include: {
            students: {
              include: {
                user: true,
              },
            },
          },
        },
        attendance: true,
      },
    });

    const result = [];

    for (const subject of subjects) {
      const studentStats = [];

      for (const student of subject.class.students) {
        const attendanceRecords = await prisma.attendance.findMany({
          where: {
            subjectId: subject.id,
            studentId: student.id,
          },
        });

        const presentCount = attendanceRecords.filter(
          (a) => a.status === "PRESENT"
        ).length;

        const totalCount = attendanceRecords.length;
        const percentage =
          totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

        studentStats.push({
          studentId: student.id,
          studentName: student.user.name,
          present: presentCount,
          total: totalCount,
          percentage: Math.round(percentage),
        });
      }

      result.push({
        subjectId: subject.id,
        subjectName: subject.name,
        students: studentStats,
      });
    }

    return result;
  }

  async getAttendancePercentageByUser(studentId) {
    const subjects = await prisma.subject.findMany({
      where: {
        class: {
          students: {
            some: { id: studentId },
          },
        },
      },
      include: {
        attendance: true,
        class: true,
      },
    });

    const result = [];

    for (const subject of subjects) {
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          subjectId: subject.id,
          studentId,
        },
      });

      const presentCount = attendanceRecords.filter(
        (a) => a.status === "PRESENT"
      ).length;

      const totalCount = attendanceRecords.length;
      const percentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

      result.push({
        subjectId: subject.id,
        subjectName: subject.name,
        present: presentCount,
        total: totalCount,
        percentage: Math.round(percentage),
      });
    }

    return result;
  }
}
