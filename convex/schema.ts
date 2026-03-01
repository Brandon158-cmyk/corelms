import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

/**
 * User roles across the multi-tenant CoreLMS platform.
 * Aligned with system.md Section 8.1 Roles & Permissions Matrix.
 */
export const USER_ROLES = v.union(
  v.literal("superAdmin"),
  v.literal("proprietor"),
  v.literal("headteacher"),
  v.literal("bursar"),
  v.literal("teacher"),
  v.literal("boardingMatron"),
  v.literal("student"),
  v.literal("parent"),
);

/**
 * Tenant (school) status values.
 */
export const TENANT_STATUS = v.union(
  v.literal("active"),
  v.literal("inactive"),
  v.literal("suspended"),
);

/**
 * School type classification per system.md Section 1.1.
 */
export const SCHOOL_TYPE = v.union(
  v.literal("public"),
  v.literal("private"),
  v.literal("grantAided"),
  v.literal("community"),
  v.literal("international"),
);

const schema = defineSchema({
  ...authTables,

  /**
   * Override the default users table from authTables to add custom fields.
   * See: https://labs.convex.dev/auth/setup/schema#customizing-the-users-table
   */
  users: defineTable({
    // Default Convex Auth fields (must remain optional)
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Custom CoreLMS fields
    role: v.optional(v.string()),
    tenantId: v.optional(v.id("tenants")),
    status: v.optional(v.string()),
    classId: v.optional(v.id("classes")),
  })
    .index("email", ["email"])
    .index("by_tenant", ["tenantId"])
    .index("by_tenant_role", ["tenantId", "role"])
    .index("by_class", ["classId"])
    .index("by_tenant_and_class", ["tenantId", "classId"]),

  /**
   * Tenants table — represents individual schools/organizations.
   * Extended with system.md Section 1.1 fields: schoolType, educationLevel,
   * emisNumber, and eczCentreCode.
   */
  tenants: defineTable({
    name: v.string(),
    schoolCode: v.string(),
    schoolType: v.optional(SCHOOL_TYPE),
    educationLevel: v.optional(v.array(v.string())),
    emisNumber: v.optional(v.string()),
    eczCentreCode: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    logo: v.optional(v.string()),
    status: TENANT_STATUS,
    subscriptionTier: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_schoolCode", ["schoolCode"])
    .index("by_status", ["status"]),

  /**
   * Password reset tokens for the forgot-password flow.
   */
  passwordResetTokens: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
  })
    .index("by_token", ["token"])
    .index("by_userId", ["userId"]),

  /**
   * Grades table — top-level educational levels (e.g., "Grade 1").
   */
  grades: defineTable({
    tenantId: v.id("tenants"),
    name: v.string(),
    description: v.optional(v.string()),
  }).index("by_tenant", ["tenantId"]),

  /**
   * Subjects table — areas of study (e.g., "Mathematics").
   */
  subjects: defineTable({
    tenantId: v.id("tenants"),
    name: v.string(),
    description: v.optional(v.string()),
  }).index("by_tenant", ["tenantId"]),

  /**
   * Classes table — a specific cohort within a grade (e.g., "B1").
   */
  classes: defineTable({
    tenantId: v.id("tenants"),
    gradeId: v.id("grades"),
    termId: v.optional(v.id("terms")),
    name: v.string(),
    description: v.optional(v.string()),
    teacherId: v.optional(v.id("users")),
    room: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("archived")),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_grade", ["gradeId"])
    .index("by_term", ["termId"])
    .index("by_tenant_teacher", ["tenantId", "teacherId"]),

  /**
   * ClassSubjects table — links a subject to a class and assigns a teacher.
   */
  classSubjects: defineTable({
    classId: v.id("classes"),
    subjectId: v.id("subjects"),
    teacherId: v.optional(v.id("users")),
  })
    .index("by_class", ["classId"])
    .index("by_subject", ["subjectId"])
    .index("by_teacher", ["teacherId"]),

  /**
   * Attendance table — daily or subject-level attendance records.
   */
  attendance: defineTable({
    tenantId: v.id("tenants"),
    classId: v.id("classes"),
    subjectId: v.optional(v.id("subjects")), // Optional: if missing -> daily class attendance
    studentId: v.id("users"),
    date: v.string(), // ISO String 'YYYY-MM-DD'
    status: v.union(
      v.literal("present"),
      v.literal("absent"),
      v.literal("late"),
      v.literal("excused"),
    ),
    notes: v.optional(v.string()),
    markedBy: v.id("users"), // Teacher or Admin ID
  })
    .index("by_tenant", ["tenantId"])
    .index("by_class_date", ["classId", "date"])
    .index("by_class_subject_date", ["classId", "subjectId", "date"])
    .index("by_student", ["studentId"]),

  /**
   * AcademicYears table — represents a school year (e.g., "2026").
   */
  academicYears: defineTable({
    tenantId: v.id("tenants"),
    name: v.string(),
    startDate: v.string(), // ISO String 'YYYY-MM-DD'
    endDate: v.string(), // ISO String 'YYYY-MM-DD'
    isCurrent: v.boolean(),
  }).index("by_tenant", ["tenantId"]),

  /**
   * Terms table — represents a term within an academic year.
   * Defaults to a three-term structure per system.md Section 2.1.
   */
  terms: defineTable({
    tenantId: v.id("tenants"),
    yearId: v.id("academicYears"),
    name: v.string(),
    startDate: v.string(), // ISO String 'YYYY-MM-DD'
    endDate: v.string(), // ISO String 'YYYY-MM-DD'
    isCurrent: v.boolean(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_year", ["yearId"]),

  /**
   * StudentProfiles table — complete SIS record for a student.
   * Linked 1:1 with a user role="student" in the users table.
   * See system.md Section 6.1
   */
  studentProfiles: defineTable({
    userId: v.id("users"), // Foreign key to users
    tenantId: v.id("tenants"),
    dateOfBirth: v.optional(v.string()), // ISO String 'YYYY-MM-DD'
    gender: v.optional(v.union(v.literal("Male"), v.literal("Female"))),
    nrcNumber: v.optional(v.string()), // For older students
    birthCertificateOrUnder5Card: v.optional(v.string()),
    address: v.optional(v.string()),

    // Medical & Emergency
    medicalConditions: v.optional(v.string()),
    allergies: v.optional(v.string()),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    emergencyContactRelation: v.optional(v.string()),

    // Parent/Guardian link
    guardianId: v.optional(v.id("users")), // Parent user account linked
  })
    .index("by_user", ["userId"])
    .index("by_tenant", ["tenantId"]),

  /**
   * Assessments table — stores assessment headers (exams, quizzes, etc.)
   */
  assessments: defineTable({
    tenantId: v.id("tenants"),
    classId: v.id("classes"),
    subjectId: v.id("subjects"),
    termId: v.id("terms"),
    title: v.string(), // e.g., "Mid-Term Math Test"
    type: v.union(
      v.literal("assignment"),
      v.literal("quiz"),
      v.literal("exam"),
      v.literal("project"),
    ),
    totalScore: v.number(), // the maximum possible score (e.g., 100)
    date: v.string(), // ISO String 'YYYY-MM-DD'
    teacherId: v.id("users"), // Author
    status: v.union(v.literal("draft"), v.literal("published")),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_class_subject", ["classId", "subjectId"])
    .index("by_term", ["termId"]),

  /**
   * Assessment Marks table — stores individual student scores.
   */
  assessmentMarks: defineTable({
    assessmentId: v.id("assessments"),
    studentId: v.id("users"),
    score: v.number(), // The raw score achieved
    comments: v.optional(v.string()), // Optional teacher feedback
  })
    .index("by_assessment", ["assessmentId"])
    .index("by_student", ["studentId"]),

  /**
   * Special Educational Needs (SEN) assessments.
   * Based on Zambia's MoE Early Grade Screening Tool.
   */
  senAssessments: defineTable({
    tenantId: v.id("tenants"),
    studentId: v.id("users"),
    authorId: v.id("users"), // Teacher/Admin who recorded it
    date: v.string(), // ISO String 'YYYY-MM-DD'
    visualScore: v.number(), // out of 10
    hearingScore: v.number(), // out of 10
    intellectualScore: v.number(), // out of 10
    totalScore: v.number(),
    flagged: v.boolean(), // Total <= 14 triggers flag for SENCO
    notes: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("submitted")),
  })
    .index("by_student", ["studentId"])
    .index("by_tenant", ["tenantId"]),

  /**
   * Disciplinary infractions and points system.
   */
  disciplineLogs: defineTable({
    tenantId: v.id("tenants"),
    studentId: v.id("users"),
    reporterId: v.id("users"),
    date: v.string(), // ISO String 'YYYY-MM-DD'
    category: v.union(
      v.literal("minor"),
      v.literal("moderate"),
      v.literal("severe"),
    ),
    infraction: v.string(), // Extracted from Code of Conduct list
    pointsDeducted: v.number(),
    restorativeAction: v.optional(v.string()),
    status: v.union(
      v.literal("open"),
      v.literal("resolved"),
      v.literal("escalated"),
    ),
  })
    .index("by_student", ["studentId"])
    .index("by_tenant", ["tenantId"]),

  /**
   * Report Cards — generated per-student-per-term snapshots.
   * Aggregates assessment marks, attendance, and discipline data.
   */
  reportCards: defineTable({
    tenantId: v.id("tenants"),
    studentId: v.id("users"),
    classId: v.id("classes"),
    termId: v.id("terms"),
    gradingScale: v.union(
      v.literal("primary"),
      v.literal("junior_secondary"),
      v.literal("senior_secondary"),
    ),
    subjects: v.array(
      v.object({
        subjectId: v.id("subjects"),
        subjectName: v.string(),
        totalScore: v.number(),
        totalOutOf: v.number(),
        percentage: v.number(),
        grade: v.string(),
        color: v.string(),
        teacherComment: v.optional(v.string()),
      }),
    ),
    attendanceSummary: v.object({
      totalDays: v.number(),
      present: v.number(),
      absent: v.number(),
      late: v.number(),
      excused: v.number(),
    }),
    disciplineSummary: v.object({
      totalIncidents: v.number(),
      totalPointsDeducted: v.number(),
    }),
    classTeacherComment: v.optional(v.string()),
    headteacherComment: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published")),
    generatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_student", ["studentId"])
    .index("by_class_term", ["classId", "termId"]),
});

export default schema;
