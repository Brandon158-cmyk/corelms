import { mutation } from "./_generated/server";

/**
 * Comprehensive database seeder for CoreLMS.
 * Creates 3 schools with full operational data.
 * Run via: pnpx convex run seed:seedAll
 */
export const seedAll = mutation({
  handler: async (ctx) => {
    // ━━━ Helper ━━━
    const rnd = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const FIRST = [
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
    const LAST = [
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
    const name = () => `${rnd(FIRST)} ${rnd(LAST)}`;
    const year = new Date().getFullYear();

    const SCHOOLS = [
      {
        name: "CoreLMS Demo Academy",
        code: "DEMO_123",
        type: "private" as const,
      },
      { name: "St. Marks Secondary", code: "SM_456", type: "public" as const },
      {
        name: "International School of Lusaka",
        code: "ISL_789",
        type: "international" as const,
      },
    ];

    for (const school of SCHOOLS) {
      // ────────── 1. Tenant ──────────
      const tenantId = await ctx.db.insert("tenants", {
        name: school.name,
        schoolCode: school.code,
        schoolType: school.type,
        status: "active",
        createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
      });

      // ────────── 2. Academic Year & Terms ──────────
      const yearId = await ctx.db.insert("academicYears", {
        tenantId,
        name: `${year}`,
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
        isCurrent: true,
      });

      const term1Id = await ctx.db.insert("terms", {
        tenantId,
        yearId,
        name: "Term 1",
        startDate: `${year}-01-05`,
        endDate: `${year}-04-10`,
        isCurrent: true,
      });
      await ctx.db.insert("terms", {
        tenantId,
        yearId,
        name: "Term 2",
        startDate: `${year}-05-10`,
        endDate: `${year}-08-15`,
        isCurrent: false,
      });
      await ctx.db.insert("terms", {
        tenantId,
        yearId,
        name: "Term 3",
        startDate: `${year}-09-01`,
        endDate: `${year}-12-05`,
        isCurrent: false,
      });

      // ────────── 3. Grades & Subjects ──────────
      const gradeNames = [
        "Grade 8",
        "Grade 9",
        "Grade 10",
        "Grade 11",
        "Grade 12",
      ];
      const gradeIds = [];
      for (const gn of gradeNames) {
        gradeIds.push(await ctx.db.insert("grades", { tenantId, name: gn }));
      }

      const subjectNames = [
        "Mathematics",
        "English",
        "Biology",
        "Physics",
        "History",
      ];
      const subjectIds = [];
      for (const sn of subjectNames) {
        subjectIds.push(
          await ctx.db.insert("subjects", { tenantId, name: sn }),
        );
      }

      // ────────── 4. Staff Users ──────────
      const proprietorId = await ctx.db.insert("users", {
        name: name(),
        email: `proprietor@${school.code.toLowerCase()}.com`,
        role: "proprietor",
        tenantId,
        status: "active",
      });
      const headteacherId = await ctx.db.insert("users", {
        name: name(),
        email: `headteacher@${school.code.toLowerCase()}.com`,
        role: "headteacher",
        tenantId,
        status: "active",
      });
      const bursarId = await ctx.db.insert("users", {
        name: name(),
        email: `bursar@${school.code.toLowerCase()}.com`,
        role: "bursar",
        tenantId,
        status: "active",
      });

      const teacherIds = [];
      for (let i = 1; i <= 6; i++) {
        const tid = await ctx.db.insert("users", {
          name: name(),
          email: `teacher${i}@${school.code.toLowerCase()}.com`,
          role: "teacher",
          tenantId,
          status: "active",
        });
        teacherIds.push(tid);
        await ctx.db.insert("staffProfiles", {
          tenantId,
          userId: tid,
          designation: i === 1 ? "Senior HOD" : "Teacher",
          idNumber: `NRC-${Math.floor(Math.random() * 100000)}`,
          contractType: "permanent",
          dateJoined: "2024-01-01",
          qualifications: ["Bachelor of Education"],
          basicSalary: 6000 + i * 500,
        });
        // Staff attendance
        for (let d = 1; d <= 5; d++) {
          await ctx.db.insert("staffAttendance", {
            tenantId,
            userId: tid,
            date: `2026-03-0${d}`,
            status: "present",
            checkIn: "07:30",
            checkOut: "17:00",
          });
        }
      }

      // ────────── 5. Fee Types ──────────
      const tuitionFTId = await ctx.db.insert("feeTypes", {
        tenantId,
        name: "Tuition Fee",
        amount: 3000,
        termId: term1Id,
      });

      // ────────── 6. Hostel ──────────
      const hostelId = await ctx.db.insert("hostels", {
        tenantId,
        name: "Victoria Hostel",
        gender: "boys" as const,
        capacity: 100,
      });
      const dormId = await ctx.db.insert("dormitories", {
        tenantId,
        hostelId,
        name: "Wing A",
        bedCount: 20,
      });

      // ────────── 7. Transport ──────────
      await ctx.db.insert("vehicles", {
        tenantId,
        name: "Bus 1",
        plateNumber: "BAV 123",
        capacity: 60,
        status: "active" as const,
      });
      await ctx.db.insert("routes", {
        tenantId,
        name: "Main Road",
        type: "both" as const,
        status: "active" as const,
      });

      // ────────── 8. Timetable Slots ──────────
      const slotIds = [];
      for (const day of ["monday", "tuesday"] as const) {
        for (let p = 1; p <= 3; p++) {
          const sid = await ctx.db.insert("timetableSlots", {
            tenantId,
            day,
            periodNumber: p,
            startTime: `0${7 + p}:00`,
            endTime: `0${7 + p}:40`,
            type: "lesson" as const,
          });
          slotIds.push(sid);
        }
      }

      // ────────── 9. Announcement ──────────
      await ctx.db.insert("announcements", {
        tenantId,
        title: "Welcome to Term 1!",
        content: "We wish all students and staff a successful term.",
        audience: "all" as const,
        authorId: headteacherId,
        priority: "normal" as const,
        createdAt: Date.now(),
      });
      await ctx.db.insert("communicationTemplates", {
        tenantId,
        name: "Fee Reminder",
        type: "sms" as const,
        content:
          "Dear Parent, this is a reminder that your balance is {{balance}}.",
      });

      // ────────── 10. Payrun ──────────
      await ctx.db.insert("payruns", {
        tenantId,
        month: 3,
        year: 2026,
        status: "paid" as const,
        totalGross: 45000,
        totalNet: 35000,
        totalTax: 10000,
        totalNAPSA: 2000,
        totalNHIMA: 500,
        processedBy: bursarId,
        processedAt: Date.now(),
      });

      // ────────── 11. Classes, Students & Operations ──────────
      for (let gIdx = 0; gIdx < 3; gIdx++) {
        const gradeId = gradeIds[gIdx];
        const classId = await ctx.db.insert("classes", {
          tenantId,
          gradeId,
          termId: term1Id,
          name: `${gradeNames[gIdx]} Alpha`,
          teacherId: teacherIds[0],
          status: "active" as const,
        });

        // Timetable entries
        for (let si = 0; si < slotIds.length; si++) {
          await ctx.db.insert("timetableEntries", {
            tenantId,
            slotId: slotIds[si],
            classId,
            subjectId: subjectIds[si % subjectIds.length],
            teacherId: teacherIds[si % teacherIds.length],
          });
        }

        // Assessments & LMS per subject
        for (const subjectId of subjectIds) {
          const assId = await ctx.db.insert("assessments", {
            tenantId,
            classId,
            subjectId,
            termId: term1Id,
            title: "Quiz 1",
            type: "quiz" as const,
            totalScore: 20,
            date: "2026-03-10",
            teacherId: teacherIds[2],
            status: "published" as const,
          });
          const courseId = await ctx.db.insert("courses", {
            tenantId,
            classId,
            subjectId,
            title: `Intro to ${subjectNames[subjectIds.indexOf(subjectId)]}`,
            createdBy: teacherIds[2],
            status: "active" as const,
          });
          await ctx.db.insert("lessons", {
            courseId,
            title: "Welcome & Overview",
            content:
              "# Welcome\nIn this course we will cover the fundamentals.",
            order: 1,
            type: "lesson" as const,
          });
          await ctx.db.insert("lmsAssignments", {
            tenantId,
            courseId,
            title: "Homework 1",
            instructions: "Complete exercises on pages 1-10.",
            dueDate: "2026-03-15",
            totalMarks: 10,
            createdBy: teacherIds[2],
            status: "open" as const,
          });

          // ── Students ──
          for (let s = 1; s <= 8; s++) {
            // Only create the student once per class (on first subject loop)
            if (subjectId === subjectIds[0]) {
              const studentId = await ctx.db.insert("users", {
                name: name(),
                email: `student${s}.g${gIdx + 8}@${school.code.toLowerCase()}.com`,
                role: "student",
                tenantId,
                classId,
                status: "active",
              });
              await ctx.db.insert("studentProfiles", {
                userId: studentId,
                tenantId,
                gender:
                  Math.random() > 0.5 ? ("Male" as const) : ("Female" as const),
                dateOfBirth: "2011-05-15",
              });
              // Attendance
              await ctx.db.insert("attendance", {
                tenantId,
                classId,
                studentId,
                date: "2026-03-01",
                status:
                  Math.random() > 0.9
                    ? ("absent" as const)
                    : ("present" as const),
                markedBy: teacherIds[0],
              });
              // Invoice
              const invId = await ctx.db.insert("invoices", {
                tenantId,
                studentId,
                classId,
                termId: term1Id,
                totalAmount: 3000,
                balance: 500,
                status: "partial" as const,
                dueDate: "2026-03-31",
                createdAt: Date.now(),
              });
              await ctx.db.insert("invoiceItems", {
                invoiceId: invId,
                feeTypeId: tuitionFTId,
                amount: 3000,
                description: "Tuition",
              });
              await ctx.db.insert("payments", {
                tenantId,
                studentId,
                invoiceId: invId,
                amount: 2500,
                method: "cash" as const,
                date: "2026-03-02",
                recordedBy: bursarId,
              });
              // Discipline
              if (s === 1) {
                await ctx.db.insert("disciplineLogs", {
                  tenantId,
                  studentId,
                  reporterId: teacherIds[1],
                  date: "2026-03-02",
                  category: "minor" as const,
                  infraction: "Late to class",
                  pointsDeducted: 1,
                  status: "resolved" as const,
                });
              }
              // Hostel
              if (s <= 4) {
                await ctx.db.insert("hostelAllocations", {
                  tenantId,
                  studentId,
                  hostelId,
                  dormitoryId: dormId,
                  termId: term1Id,
                  status: "active" as const,
                });
              }
              // Risk score
              await ctx.db.insert("studentRiskScores", {
                tenantId,
                studentId,
                attendanceScore: 80 + Math.floor(Math.random() * 20),
                academicScore: 60 + Math.floor(Math.random() * 40),
                disciplineScore: 90 + Math.floor(Math.random() * 10),
                overallRisk: 70 + Math.floor(Math.random() * 30),
                riskLevel: "low" as const,
                factors: [],
                computedAt: Date.now(),
              });
            }

            // Assessment mark for every student for every subject
            // We need to get the student IDs from the class
            // Since we insert students only on first subject, we need to store them
          }
        }
      }

      console.log(`✅ Seeded school: ${school.name}`);
    }

    return "Database seeded successfully with 3 schools!";
  },
});
