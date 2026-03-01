const fs = require("fs");
const path = require("path");

const SEED_DIR = path.join(__dirname, "../seed-data");
if (!fs.existsSync(SEED_DIR)) {
  fs.mkdirSync(SEED_DIR);
}

// Helper to generate a valid Convex-like ID (32 chars)
function generateId(table) {
  const chars = "0123456789abcdefghjkmnpqrstvwxyz"; // Alphabet excluding i, l, o, u
  let id = "k";
  for (let i = 0; i < 31; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

const SCHOOLS = [
  { name: "CoreLMS Demo Academy", code: "DEMO_123", type: "private" },
  { name: "St. Marks Secondary", code: "SM_456", type: "public" },
  {
    name: "International School of Lusaka",
    code: "ISL_789",
    type: "international",
  },
];

const FIRST_NAMES = [
  "Amani",
  "Banji",
  "Chipo",
  "Doreen",
  "Enock",
  "Faith",
  "Gift",
  "Hope",
  "Isaac",
  "John",
  "Kelvin",
  "Lumbani",
  "Mabvuto",
  "Niza",
  "Owen",
  "Precious",
  "Quincy",
  "Racheal",
  "Samuel",
  "Tatenda",
  "Ulemu",
  "Victor",
  "Wendy",
  "Xavier",
  "Yoram",
  "Zanele",
];
const LAST_NAMES = [
  "Banda",
  "Chanda",
  "Daka",
  "Hamalambo",
  "Kafunda",
  "Lungu",
  "Mumba",
  "Nyakutemba",
  "Phiri",
  "Sampa",
  "Tembo",
  "Zulu",
];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const data = {
  tenants: [],
  academicYears: [],
  terms: [],
  grades: [],
  subjects: [],
  users: [],
  studentProfiles: [],
  staffProfiles: [],
  classes: [],
  classSubjects: [],
  attendance: [],
  assessments: [],
  assessmentMarks: [],
  invoices: [],
  invoiceItems: [],
  payments: [],
  feeTypes: [],
  disciplineLogs: [],
  courses: [],
  lessons: [],
  lmsAssignments: [],
  lmsSubmissions: [],
  staffAttendance: [],
  payruns: [],
  payslips: [],
  hostels: [],
  dormitories: [],
  hostelAllocations: [],
  exeatRequests: [],
  vehicles: [],
  routes: [],
  routeStops: [],
  tripLogs: [],
  timetableSlots: [],
  timetableEntries: [],
  senScreenings: [],
  senReferrals: [],
  announcements: [],
  communicationLogs: [],
  communicationTemplates: [],
  studentRiskScores: [],
  passwordResetTokens: [],
};

// Start generation
SCHOOLS.forEach((school) => {
  const tenant = {
    _id: generateId("tenants"),
    name: school.name,
    schoolCode: school.code,
    schoolType: school.type,
    status: "active",
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
  };
  data.tenants.push(tenant);

  // Academic Year & Terms
  const currentYear = new Date().getFullYear();
  const yearId = generateId("academicYears");
  data.academicYears.push({
    _id: yearId,
    tenantId: tenant._id,
    name: `${currentYear}`,
    startDate: `${currentYear}-01-01`,
    endDate: `${currentYear}-12-31`,
    isCurrent: true,
  });

  const termIds = [];
  ["Term 1", "Term 2", "Term 3"].forEach((name, i) => {
    const tid = generateId("terms");
    termIds.push(tid);
    data.terms.push({
      _id: tid,
      tenantId: tenant._id,
      yearId: yearId,
      name: name,
      startDate: `${currentYear}-0${i * 3 + 1}-05`,
      endDate: `${currentYear}-0${i * 3 + 3}-10`,
      isCurrent: i === 0,
    });
  });
  const currentTermId = termIds[0];

  // Grades & Subjects
  const Grades = ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const gradeIds = Grades.map((name) => {
    const id = generateId("grades");
    data.grades.push({ _id: id, tenantId: tenant._id, name });
    return id;
  });
  const Subjects = ["Mathematics", "English", "Biology", "Physics", "History"];
  const subjectIds = Subjects.map((name) => {
    const id = generateId("subjects");
    data.subjects.push({ _id: id, tenantId: tenant._id, name });
    return id;
  });

  // Staff roles
  const staffByRole = {};
  ["proprietor", "headteacher", "bursar"].forEach((role) => {
    const uid = generateId("users");
    data.users.push({
      _id: uid,
      name: `${randomElement(FIRST_NAMES)} ${randomElement(LAST_NAMES)}`,
      email: `${role}@${tenant.schoolCode.toLowerCase()}.com`,
      role,
      tenantId: tenant._id,
      status: "active",
    });
    staffByRole[role] = uid;
  });

  const teacherIds = [];
  for (let i = 1; i <= 6; i++) {
    const tid = generateId("users");
    teacherIds.push(tid);
    data.users.push({
      _id: tid,
      name: `${randomElement(FIRST_NAMES)} ${randomElement(LAST_NAMES)}`,
      email: `teacher${i}@${tenant.schoolCode.toLowerCase()}.com`,
      role: "teacher",
      tenantId: tenant._id,
      status: "active",
    });
    data.staffProfiles.push({
      _id: generateId("staffProfiles"),
      tenantId: tenant._id,
      userId: tid,
      designation: i === 1 ? "Senior HOD" : "Teacher",
      idNumber: `NRC-${Math.floor(Math.random() * 100000)}`,
      contractType: "permanent",
      dateJoined: "2024-01-01",
      qualifications: ["Bachelor Degree"],
      basicSalary: 6000 + i * 500,
    });
    // Staff Attendance
    for (let d = 1; d <= 5; d++) {
      data.staffAttendance.push({
        _id: generateId("staffAttendance"),
        tenantId: tenant._id,
        userId: tid,
        date: `2026-03-0${d}`,
        status: "present",
        checkIn: "07:30",
        checkOut: "17:00",
      });
    }
  }

  // Fee Types
  const tuitionFTId = generateId("feeTypes");
  data.feeTypes.push({
    _id: tuitionFTId,
    tenantId: tenant._id,
    name: "Tuition Fee",
    amount: 3000,
    termId: currentTermId,
  });

  // Hostels
  const hostelId = generateId("hostels");
  data.hostels.push({
    _id: hostelId,
    tenantId: tenant._id,
    name: "Victoria Hostel",
    gender: "boys",
    capacity: 100,
  });
  const dormId = generateId("dormitories");
  data.dormitories.push({
    _id: dormId,
    tenantId: tenant._id,
    hostelId,
    name: "Wing A",
    bedCount: 20,
  });

  // Transport
  const busId = generateId("vehicles");
  data.vehicles.push({
    _id: busId,
    tenantId: tenant._id,
    name: "Bus 1",
    plateNumber: "BAV 123",
    capacity: 60,
    status: "active",
  });
  const routeId = generateId("routes");
  data.routes.push({
    _id: routeId,
    tenantId: tenant._id,
    name: "Main Road",
    type: "both",
    status: "active",
  });

  // Timetable slots
  const slotIds = [];
  ["monday", "tuesday"].forEach((day) => {
    for (let p = 1; p <= 3; p++) {
      const sid = generateId("timetableSlots");
      slotIds.push(sid);
      data.timetableSlots.push({
        _id: sid,
        tenantId: tenant._id,
        day,
        periodNumber: p,
        startTime: `0${7 + p}:00`,
        endTime: `0${7 + p}:40`,
        type: "lesson",
      });
    }
  });

  // Classes & Operational Loops
  gradeIds.slice(0, 3).forEach((gradeId, gIdx) => {
    const classId = generateId("classes");
    const className = `${Grades[gIdx]} Alpha`;
    data.classes.push({
      _id: classId,
      tenantId: tenant._id,
      gradeId,
      termId: currentTermId,
      name: className,
      teacherId: teacherIds[0],
      status: "active",
    });

    // Timetable
    slotIds.forEach((sid, idx) => {
      data.timetableEntries.push({
        _id: generateId("timetableEntries"),
        tenantId: tenant._id,
        slotId: sid,
        classId,
        subjectId: subjectIds[idx % subjectIds.length],
        teacherId: randomElement(teacherIds),
      });
    });

    // Students
    for (let s = 1; s <= 10; s++) {
      const studentId = generateId("users");
      data.users.push({
        _id: studentId,
        name: `Student ${s} ${className}`,
        email: `student${s}.${tenant.schoolCode.toLowerCase()}@example.com`,
        role: "student",
        tenantId: tenant._id,
        classId,
        status: "active",
      });
      data.studentProfiles.push({
        _id: generateId("studentProfiles"),
        userId: studentId,
        tenantId: tenant._id,
        gender: "Male",
      });

      // Attendance
      data.attendance.push({
        _id: generateId("attendance"),
        tenantId: tenant._id,
        classId,
        studentId,
        date: "2026-03-01",
        status: "present",
        markedBy: teacherIds[0],
      });

      // Finance
      const invId = generateId("invoices");
      data.invoices.push({
        _id: invId,
        tenantId: tenant._id,
        studentId,
        classId,
        termId: currentTermId,
        totalAmount: 3000,
        balance: 500,
        status: "partial",
        dueDate: "2026-03-31",
        createdAt: Date.now(),
      });
      data.invoiceItems.push({
        _id: generateId("invoiceItems"),
        invoiceId: invId,
        feeTypeId: tuitionFTId,
        amount: 3000,
        description: "Tuition",
      });
      data.payments.push({
        _id: generateId("payments"),
        tenantId: tenant._id,
        studentId,
        invoiceId: invId,
        amount: 2500,
        method: "cash",
        date: "2026-03-02",
        recordedBy: staffByRole["bursar"],
      });

      // Discipline
      if (s === 1) {
        data.disciplineLogs.push({
          _id: generateId("disciplineLogs"),
          tenantId: tenant._id,
          studentId,
          reporterId: teacherIds[1],
          date: "2026-03-02",
          category: "minor",
          infraction: "Late to class",
          pointsDeducted: 1,
          status: "resolved",
        });
      }

      // Hostel
      if (s <= 5) {
        data.hostelAllocations.push({
          _id: generateId("hostelAllocations"),
          tenantId: tenant._id,
          studentId,
          hostelId,
          dormitoryId: dormId,
          termId: currentTermId,
          status: "active",
        });
      }
    }

    // Assessments & LMS
    subjectIds.forEach((subjectId) => {
      const assId = generateId("assessments");
      data.assessments.push({
        _id: assId,
        tenantId: tenant._id,
        classId,
        subjectId,
        termId: currentTermId,
        title: "Quiz 1",
        type: "quiz",
        totalScore: 20,
        date: "2026-03-10",
        teacherId: teacherIds[2],
        status: "published",
      });

      const courseId = generateId("courses");
      data.courses.push({
        _id: courseId,
        tenantId: tenant._id,
        classId,
        subjectId,
        title: "Unit 1",
        createdBy: teacherIds[2],
        status: "active",
      });
      const lessonId = generateId("lessons");
      data.lessons.push({
        _id: lessonId,
        courseId,
        title: "Introduction",
        content: "Rules...",
        order: 1,
        type: "lesson",
      });

      const assignId = generateId("lmsAssignments");
      data.lmsAssignments.push({
        _id: assignId,
        tenantId: tenant._id,
        courseId,
        title: "Homework 1",
        instructions: "Read page 1",
        dueDate: "2026-03-15",
        totalMarks: 10,
        createdBy: teacherIds[2],
        status: "open",
      });
    });
  });

  // Payroll
  const payrunId = generateId("payruns");
  data.payruns.push({
    _id: payrunId,
    tenantId: tenant._id,
    month: 3,
    year: 2026,
    status: "paid",
    totalGross: 45000,
    totalNet: 35000,
    totalTax: 10000,
    totalNAPSA: 2000,
    totalNHIMA: 500,
    processedBy: staffByRole["bursar"],
    processedAt: Date.now(),
  });

  // System
  data.announcements.push({
    _id: generateId("announcements"),
    tenantId: tenant._id,
    title: "Exam Date",
    content: "Exams start on 20th",
    audience: "all",
    authorId: staffByRole["headteacher"],
    priority: "normal",
    createdAt: Date.now(),
  });
  data.communicationTemplates.push({
    _id: generateId("communicationTemplates"),
    tenantId: tenant._id,
    name: "Welcome",
    type: "email",
    content: "Welcome to CoreLMS",
  });
});

// Save
Object.keys(data).forEach((table) => {
  if (data[table].length > 0) {
    fs.writeFileSync(
      path.join(SEED_DIR, `${table}.json`),
      JSON.stringify(data[table], null, 2),
    );
    console.log(`Saved ${data[table].length} to ${table}`);
  }
});
