import prisma from "../db/index.js";

export class AdminService {
  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async deleteUserById(userId) {
    return prisma.user.delete({
      where: { id: userId },
    });
  }

  async updateUserRole(userId, newRole) {
    return prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });
  }

  async getUserById(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }
  async getUserStatsByRole() {
    const roles = await prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
    });

    return roles.map((r) => ({ role: r.role, count: r._count.role }));
  }

  async getStudentTeacherCounts() {
    const students = await prisma.student.count();
    const teachers = await prisma.teacher.count();
    const classes = await prisma.class.count();
    const subjects = await prisma.subject.count();
    return { students, teachers, classes, subjects };
  }

  async getAssignmentStats() {
    return prisma.assignment.count();
  }

  async findDetailById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        student: {
          select: {
            class: {
              select: { name: true },
            },
            attendance: {
              select: { status: true },
            },
            MonthlyResult: {
              select: {
                month: true,
                marks: true,
                totalMarks: true,
                subject: {
                  select: { name: true },
                },
              },
            },
          },
        },
        teacher: {
          select: {
            subjects: {
              select: { name: true },
            },
            Assignment: true,
          },
        },
      },
    });

    if (!user) return null;

    // For students: calculate attendance % and prepare results
    if (user.role === "STUDENT" && user.student) {
      const attendance = user.student.attendance;
      const total = attendance.length;
      const present = attendance.filter((a) => a.status === "PRESENT").length;
      const attendancePercentage =
        total > 0 ? Math.round((present / total) * 100) : 0;

      user.student.attendancePercentage = attendancePercentage;

      // Optional: Clean up attendance array if not needed
      delete user.student.attendance;
    }

    // For teachers: count assignments
    if (user.role === "TEACHER" && user.teacher) {
      user.teacher.assignmentCount = user.teacher.Assignment.length;
      delete user.teacher.Assignment;
    }

    return user;
  }

  async getAttendanceSummary() {
    const summary = await prisma.attendance.groupBy({
      by: ["status"],
      _count: true,
    });

    return summary.map((s) => ({
      status: s.status,
      count: s._count,
    }));
  }
  async getMonthlyResultStats() {
    const result = await prisma.$queryRawUnsafe(`
      SELECT
        "month",
        COUNT(CASE WHEN ("marks" * 100.0 / "totalMarks") >= 50 THEN 1 END) AS "passed",
        COUNT(CASE WHEN ("marks" * 100.0 / "totalMarks") < 50 THEN 1 END) AS "failed"
      FROM "MonthlyResult"
      GROUP BY "month"
      ORDER BY "month" ASC;
    `);

    // Convert BigInt values to normal JS numbers
    return result.map((row) => ({
      month: row.month,
      passed: Number(row.passed),
      failed: Number(row.failed),
    }));
  }
}
