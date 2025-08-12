import prisma from "../db/index.js";

export class AttendanceService {
  async markAttendance({ studentId, subjectId, date, status }) {
    return await prisma.attendance.create({
      data: { studentId, subjectId, date, status },
    });
  }

  async getAttendanceByStudent(Id) {
    let studentId = await prisma.student.findUnique({
      where: { userId: Id },
      select: { id: true },
    });
    studentId = studentId.id;
    return await prisma.attendance.findMany({
      where: { studentId },
      include: {
        subject: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });
  }

  async getAttendancePercentageByStudent(userId) {
    // Step 1: Get the student's ID from userId
    const student = await prisma.student.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    console.log("From Service  1 ", userId);
    console.log("From Service ", student.id);

    if (!student) {
      throw new Error("Student not found");
    }

    const studentId = student.id;

    // Step 2: Count total and present attendance
    const [total, present] = await Promise.all([
      prisma.attendance.count({
        where: { studentId },
      }),
      prisma.attendance.count({
        where: {
          studentId,
          status: "PRESENT",
        },
      }),
    ]);

    // Step 3: Calculate percentage
    const percentage = total === 0 ? 0 : Math.round((present / total) * 100);

    return { percentage, present, total };
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

  // async getAttendancePercentageBySubject() {
  //   const subjects = await prisma.subject.findMany({
  //     include: {
  //       class: {
  //         include: {
  //           students: {
  //             include: {
  //               user: true,
  //             },
  //           },
  //         },
  //       },
  //       attendance: true,
  //     },
  //   });

  //   const result = [];

  //   for (const subject of subjects) {
  //     const studentStats = [];

  //     for (const student of subject.class.students) {
  //       const attendanceRecords = await prisma.attendance.findMany({
  //         where: {
  //           subjectId: subject.id,
  //           studentId: student.id,
  //         },
  //       });

  //       const presentCount = attendanceRecords.filter(
  //         (a) => a.status === "PRESENT"
  //       ).length;

  //       const totalCount = attendanceRecords.length;
  //       const percentage =
  //         totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

  //       studentStats.push({
  //         studentId: student.id,
  //         studentName: student.user.name,
  //         present: presentCount,
  //         total: totalCount,
  //         percentage: Math.round(percentage),
  //       });
  //     }

  //     result.push({
  //       subjectId: subject.id,
  //       subjectName: subject.name,
  //       students: studentStats,
  //     });
  //   }

  //   return result;
  // }
  async getAttendancePercentageBySubject(subjectId) {
    // Get the subject with its class and students
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
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
      },
    });

    if (!subject) {
      throw new Error("Subject not found");
    }

    const studentStats = [];

    // Loop through each student in the class
    for (const student of subject.class.students) {
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          subjectId,
          studentId: student.id,
        },
      });

      const presentCount = attendanceRecords.filter(
        (a) => a.status === "PRESENT"
      ).length;

      const totalCount = attendanceRecords.length;
      const percentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

      studentStats.push({
        studentId: student.id,
        studentName: student.user.name,
        present: presentCount,
        total: totalCount,
        percentage: Math.round(percentage),
      });
    }

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      students: studentStats,
    };
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
    console.log(result);

    return result;
  }
}
