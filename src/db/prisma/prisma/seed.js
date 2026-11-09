/**
 * Idempotent demo seed for the fictional Willowmere Academy.
 *
 * Safe to run more than once (`npm run db:seed`). Each run deletes and
 * recreates only:
 * - the demo users listed in this file (the @sms.example.com logins below)
 * - the fixed demo class, subject, teacher, and student ids in this file
 * - rows that reference those demo records (attendance, timetable, assignments,
 *   submissions, monthly results, subject-drop requests)
 *
 * Accounts you created with any other email are left in place.
 * There is no fees model in the schema, so this seed does not invent invoices.
 * Every person and address below is fictional. Nothing here is a real school
 * or a real employer.
 *
 * Demo logins (also listed in the README):
 *   admin@sms.example.com     DemoAdmin123!     ADMIN
 *   teacher@sms.example.com   DemoTeacher123!   TEACHER  (Jordan Hale)
 *   student@sms.example.com   DemoStudent123!   STUDENT  (Samira Cole, Grade 10)
 * Other seeded teachers share DemoTeacher123!.
 * Other seeded students share DemoStudent123!.
 */
import bcrypt from "bcryptjs";
import prisma from "../../index.js";

const uid = (n) => `11111111-1111-4111-8111-${String(n).padStart(12, "0")}`;
const day = (isoDate) => new Date(`${isoDate}T12:00:00.000Z`);

const IDS = {
  users: {
    admin: uid(1),
    jordan: uid(2),
    riley: uid(3),
    morgan: uid(4),
    samira: uid(5),
    theo: uid(6),
    priya: uid(7),
    leo: uid(8),
    hana: uid(9),
    omar: uid(10),
    mina: uid(11),
    caleb: uid(12),
  },
  teachers: { jordan: uid(101), riley: uid(102), morgan: uid(103) },
  students: {
    samira: uid(201),
    theo: uid(202),
    priya: uid(203),
    leo: uid(204),
    hana: uid(205),
    omar: uid(206),
    mina: uid(207),
    caleb: uid(208),
  },
  classes: { grade8: uid(301), grade9: uid(302), grade10: uid(303) },
  subjects: {
    g8math: uid(401),
    g8english: uid(402),
    g8computers: uid(403),
    g9math: uid(404),
    g9english: uid(405),
    g9history: uid(406),
    g10math: uid(407),
    g10english: uid(408),
    g10physics: uid(409),
    g10history: uid(410),
  },
  assignments: { linear: uid(601), narrative: uid(602), sources: uid(603) },
};

const PASSWORDS = {
  admin: "DemoAdmin123!",
  teacher: "DemoTeacher123!",
  student: "DemoStudent123!",
};

const USERS = [
  ["admin", "Avery Quinn", "admin@sms.example.com", "1986-01-20", "admin", "ADMIN"],
  ["jordan", "Jordan Hale", "teacher@sms.example.com", "1990-06-02", "teacher", "TEACHER"],
  ["riley", "Riley Okonkwo", "riley.okonkwo@sms.example.com", "1988-11-19", "teacher", "TEACHER"],
  ["morgan", "Morgan Ellis", "morgan.ellis@sms.example.com", "1993-02-08", "teacher", "TEACHER"],
  ["samira", "Samira Cole", "student@sms.example.com", "2010-04-16", "student", "STUDENT"],
  ["theo", "Theo Marchand", "theo.marchand@sms.example.com", "2010-09-03", "student", "STUDENT"],
  ["priya", "Priya Nandakumar", "priya.nandakumar@sms.example.com", "2010-12-11", "student", "STUDENT"],
  ["leo", "Leo Ferreira", "leo.ferreira@sms.example.com", "2011-05-22", "student", "STUDENT"],
  ["hana", "Hana Sato", "hana.sato@sms.example.com", "2011-07-30", "student", "STUDENT"],
  ["omar", "Omar Haddad", "omar.haddad@sms.example.com", "2011-01-14", "student", "STUDENT"],
  ["mina", "Mina Berg", "mina.berg@sms.example.com", "2012-08-09", "student", "STUDENT"],
  ["caleb", "Caleb Ortiz", "caleb.ortiz@sms.example.com", "2012-03-27", "student", "STUDENT"],
];

const STUDENT_CLASS = {
  samira: "grade10",
  theo: "grade10",
  priya: "grade10",
  leo: "grade9",
  hana: "grade9",
  omar: "grade9",
  mina: "grade8",
  caleb: "grade8",
};

const SUBJECTS = [
  ["g8math", "Mathematics", "grade8", "jordan"],
  ["g8english", "English", "grade8", "riley"],
  ["g8computers", "Computer Studies", "grade8", "morgan"],
  ["g9math", "Mathematics", "grade9", "jordan"],
  ["g9english", "English", "grade9", "riley"],
  ["g9history", "History", "grade9", "morgan"],
  ["g10math", "Mathematics", "grade10", "jordan"],
  ["g10english", "English", "grade10", "riley"],
  ["g10physics", "Physics", "grade10", "jordan"],
  ["g10history", "World History", "grade10", "morgan"],
];

const TIMETABLE = [
  ["Monday", "08:30", "09:20", "g10math", "grade10", "jordan"],
  ["Monday", "09:30", "10:20", "g10english", "grade10", "riley"],
  ["Monday", "10:30", "11:20", "g9math", "grade9", "jordan"],
  ["Monday", "11:30", "12:20", "g8computers", "grade8", "morgan"],
  ["Tuesday", "08:30", "09:20", "g10physics", "grade10", "jordan"],
  ["Tuesday", "09:30", "10:20", "g9english", "grade9", "riley"],
  ["Tuesday", "10:30", "11:20", "g10history", "grade10", "morgan"],
  ["Wednesday", "08:30", "09:20", "g10math", "grade10", "jordan"],
  ["Wednesday", "09:30", "10:20", "g8english", "grade8", "riley"],
  ["Wednesday", "10:30", "11:20", "g9history", "grade9", "morgan"],
  ["Thursday", "08:30", "09:20", "g9math", "grade9", "jordan"],
  ["Thursday", "09:30", "10:20", "g10english", "grade10", "riley"],
  ["Friday", "08:30", "09:20", "g10physics", "grade10", "jordan"],
  ["Friday", "09:30", "10:20", "g8math", "grade8", "jordan"],
];

const GRADE10_STUDENTS = ["samira", "theo", "priya"];
const ATTENDANCE_DAYS = [
  "2026-11-02",
  "2026-11-03",
  "2026-11-04",
  "2026-11-05",
  "2026-11-06",
];
const ATTENDANCE_SUBJECTS = ["g10math", "g10english"];

function attendanceStatus(studentKey, dayIndex, subjectIndex) {
  if (studentKey === "theo" && dayIndex === 2 && subjectIndex === 0) return "ABSENT";
  if (studentKey === "samira" && dayIndex === 4 && subjectIndex === 1) return "LEAVE";
  if (studentKey === "priya" && dayIndex === 1 && subjectIndex === 0) return "ABSENT";
  return "PRESENT";
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}

async function clearDemo(tx, emails) {
  const existing = await tx.user.findMany({
    where: { email: { in: emails } },
    select: {
      id: true,
      student: { select: { id: true } },
      teacher: { select: { id: true } },
    },
  });

  const userIds = uniq([
    ...Object.values(IDS.users),
    ...existing.map((user) => user.id),
  ]);
  const studentIds = uniq([
    ...Object.values(IDS.students),
    ...existing.map((user) => user.student?.id),
  ]);
  const teacherIds = uniq([
    ...Object.values(IDS.teachers),
    ...existing.map((user) => user.teacher?.id),
  ]);
  const classIds = Object.values(IDS.classes);
  const subjectIds = Object.values(IDS.subjects);
  const assignmentIds = Object.values(IDS.assignments);

  const assignmentWhere = {
    OR: [
      { id: { in: assignmentIds } },
      { classId: { in: classIds } },
      { teacherId: { in: teacherIds } },
      { subjectId: { in: subjectIds } },
    ],
  };

  await tx.assignmentSubmission.deleteMany({
    where: {
      OR: [{ studentId: { in: studentIds } }, { assignment: assignmentWhere }],
    },
  });
  await tx.monthlyResult.deleteMany({
    where: {
      OR: [{ studentId: { in: studentIds } }, { subjectId: { in: subjectIds } }],
    },
  });
  await tx.attendance.deleteMany({
    where: {
      OR: [{ studentId: { in: studentIds } }, { subjectId: { in: subjectIds } }],
    },
  });
  await tx.timetable.deleteMany({
    where: {
      OR: [
        { classId: { in: classIds } },
        { teacherId: { in: teacherIds } },
        { subjectId: { in: subjectIds } },
      ],
    },
  });
  await tx.subjectDropRequest.deleteMany({
    where: {
      OR: [{ teacherId: { in: teacherIds } }, { subjectId: { in: subjectIds } }],
    },
  });
  await tx.assignment.deleteMany({ where: assignmentWhere });
  await tx.subject.deleteMany({
    where: {
      OR: [
        { id: { in: subjectIds } },
        { classId: { in: classIds } },
        { teacherId: { in: teacherIds } },
      ],
    },
  });
  await tx.student.deleteMany({
    where: { OR: [{ id: { in: studentIds } }, { userId: { in: userIds } }] },
  });
  await tx.teacher.deleteMany({
    where: { OR: [{ id: { in: teacherIds } }, { userId: { in: userIds } }] },
  });
  await tx.class.deleteMany({ where: { id: { in: classIds } } });
  await tx.user.deleteMany({
    where: { OR: [{ id: { in: userIds } }, { email: { in: emails } }] },
  });
}

async function main() {
  const [adminHash, teacherHash, studentHash] = await Promise.all([
    bcrypt.hash(PASSWORDS.admin, 10),
    bcrypt.hash(PASSWORDS.teacher, 10),
    bcrypt.hash(PASSWORDS.student, 10),
  ]);
  const hashes = { admin: adminHash, teacher: teacherHash, student: studentHash };

  const users = USERS.map(([key, name, email, dob, passwordKey, role]) => ({
    id: IDS.users[key],
    name,
    email,
    dob: day(dob),
    password: hashes[passwordKey],
    role,
  }));

  const attendance = [];
  let attendanceKey = 901;
  for (const studentKey of GRADE10_STUDENTS) {
    ATTENDANCE_DAYS.forEach((isoDate, dayIndex) => {
      ATTENDANCE_SUBJECTS.forEach((subjectKey, subjectIndex) => {
        attendance.push({
          id: uid(attendanceKey),
          studentId: IDS.students[studentKey],
          subjectId: IDS.subjects[subjectKey],
          date: day(isoDate),
          status: attendanceStatus(studentKey, dayIndex, subjectIndex),
        });
        attendanceKey += 1;
      });
    });
  }

  const results = [
    ["samira", "g10math", "2026-09", 22, "Steady algebra work."],
    ["samira", "g10english", "2026-09", 19, "Clear paragraphs."],
    ["theo", "g10math", "2026-09", 15, "Revise factoring."],
    ["theo", "g10english", "2026-09", 18, null],
    ["priya", "g10math", "2026-09", 23, "Excellent accuracy."],
    ["priya", "g10english", "2026-09", 21, null],
    ["samira", "g10math", "2026-10", 21, "Watch negative signs."],
    ["samira", "g10english", "2026-10", 20, null],
    ["theo", "g10math", "2026-10", 17, "Improving."],
    ["theo", "g10english", "2026-10", 16, null],
    ["priya", "g10math", "2026-10", 24, null],
    ["priya", "g10english", "2026-10", 22, "Strong close reading."],
  ].map(([studentKey, subjectKey, month, marks, remarks], index) => ({
    id: uid(801 + index),
    studentId: IDS.students[studentKey],
    subjectId: IDS.subjects[subjectKey],
    month,
    marks,
    totalMarks: 25,
    remarks,
  }));

  await prisma.$transaction(
    async (tx) => {
      await clearDemo(
        tx,
        users.map((user) => user.email)
      );

      await tx.user.createMany({ data: users });
      await tx.class.createMany({
        data: [
          { id: IDS.classes.grade8, name: "Grade 8" },
          { id: IDS.classes.grade9, name: "Grade 9" },
          { id: IDS.classes.grade10, name: "Grade 10" },
        ],
      });
      await tx.teacher.createMany({
        data: [
          { id: IDS.teachers.jordan, userId: IDS.users.jordan },
          { id: IDS.teachers.riley, userId: IDS.users.riley },
          { id: IDS.teachers.morgan, userId: IDS.users.morgan },
        ],
      });
      await tx.student.createMany({
        data: Object.entries(STUDENT_CLASS).map(([key, classKey]) => ({
          id: IDS.students[key],
          userId: IDS.users[key],
          classId: IDS.classes[classKey],
        })),
      });
      await tx.subject.createMany({
        data: SUBJECTS.map(([key, name, classKey, teacherKey]) => ({
          id: IDS.subjects[key],
          name,
          classId: IDS.classes[classKey],
          teacherId: IDS.teachers[teacherKey],
        })),
      });
      await tx.timetable.createMany({
        data: TIMETABLE.map(([weekday, startTime, endTime, subjectKey, classKey, teacherKey], index) => ({
          id: uid(501 + index),
          day: weekday,
          startTime,
          endTime,
          subjectId: IDS.subjects[subjectKey],
          classId: IDS.classes[classKey],
          teacherId: IDS.teachers[teacherKey],
        })),
      });
      await tx.attendance.createMany({ data: attendance });
      await tx.assignment.createMany({
        data: [
          {
            id: IDS.assignments.linear,
            title: "Linear equations problem set",
            description: "Questions 1–12 from the Grade 10 booklet. Show each step.",
            dueDate: day("2026-11-20"),
            subjectId: IDS.subjects.g10math,
            classId: IDS.classes.grade10,
            teacherId: IDS.teachers.jordan,
          },
          {
            id: IDS.assignments.narrative,
            title: "Personal narrative draft",
            description: "600 words about a place in Willowmere that matters to a fictional narrator.",
            dueDate: day("2026-11-18"),
            subjectId: IDS.subjects.g10english,
            classId: IDS.classes.grade10,
            teacherId: IDS.teachers.riley,
          },
          {
            id: IDS.assignments.sources,
            title: "Industrial revolution source check",
            description: "Compare the two workshop accounts and note what each leaves out.",
            dueDate: day("2026-11-25"),
            subjectId: IDS.subjects.g9history,
            classId: IDS.classes.grade9,
            teacherId: IDS.teachers.morgan,
          },
        ],
      });
      await tx.assignmentSubmission.createMany({
        data: [
          {
            id: uid(701),
            assignmentId: IDS.assignments.linear,
            studentId: IDS.students.samira,
            submittedAt: day("2026-11-08"),
            fileUrl: "https://example.com/willowmere/linear-equations-samira.pdf",
            grade: 21,
            remarks: "Clear working. Watch the negative signs.",
          },
          {
            id: uid(702),
            assignmentId: IDS.assignments.linear,
            studentId: IDS.students.theo,
            submittedAt: day("2026-11-09"),
            fileUrl: "https://example.com/willowmere/linear-equations-theo.pdf",
          },
          {
            id: uid(703),
            assignmentId: IDS.assignments.narrative,
            studentId: IDS.students.samira,
            submittedAt: day("2026-11-07"),
            fileUrl: "https://example.com/willowmere/narrative-samira.pdf",
            grade: 18,
            remarks: "Strong voice. Tighten the ending.",
          },
          {
            id: uid(704),
            assignmentId: IDS.assignments.narrative,
            studentId: IDS.students.priya,
            submittedAt: day("2026-11-08"),
            fileUrl: "https://example.com/willowmere/narrative-priya.pdf",
          },
          {
            id: uid(705),
            assignmentId: IDS.assignments.sources,
            studentId: IDS.students.leo,
            submittedAt: day("2026-11-06"),
            fileUrl: "https://example.com/willowmere/sources-leo.pdf",
            grade: 16,
            remarks: "Good contrast. Cite the second source more directly.",
          },
        ],
      });
      await tx.monthlyResult.createMany({ data: results });
      await tx.subjectDropRequest.createMany({
        data: [
          {
            id: uid(1001),
            subjectId: IDS.subjects.g9history,
            teacherId: IDS.teachers.morgan,
            reason:
              "Thursday Grade 9 History overlaps the Grade 10 World History session.",
            status: "PENDING",
          },
          {
            id: uid(1002),
            subjectId: IDS.subjects.g8english,
            teacherId: IDS.teachers.riley,
            reason: "Asked to hand Grade 8 English to a new hire.",
            status: "REJECTED",
          },
        ],
      });
    },
    { maxWait: 20_000, timeout: 60_000 }
  );

  const [userCount, classCount, subjectCount, attendanceCount] = await Promise.all([
    prisma.user.count({ where: { email: { endsWith: "@sms.example.com" } } }),
    prisma.class.count({ where: { id: { in: Object.values(IDS.classes) } } }),
    prisma.subject.count({ where: { id: { in: Object.values(IDS.subjects) } } }),
    prisma.attendance.count({
      where: { studentId: { in: Object.values(IDS.students) } },
    }),
  ]);

  console.log(
    `Willowmere Academy demo ready: ${userCount} users, ${classCount} classes, ${subjectCount} subjects, ${attendanceCount} attendance rows.`
  );
  console.log("Demo logins:");
  console.log(`  admin@sms.example.com    ${PASSWORDS.admin}`);
  console.log(`  teacher@sms.example.com  ${PASSWORDS.teacher}`);
  console.log(`  student@sms.example.com  ${PASSWORDS.student}`);
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
