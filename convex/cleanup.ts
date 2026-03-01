import { mutation } from "./_generated/server";

/**
 * Data migration to convert numeric timestamps to ISO date strings (YYYY-MM-DD).
 * This runs across all tables that originally used v.number() for dates.
 */
export const migrateDates = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Academic Years (startDate, endDate)
    const years = await ctx.db.query("academicYears").collect();
    let yearsMigrated = 0;
    for (const year of years) {
      const patches: any = {};
      if (typeof year.startDate === "number") {
        patches.startDate = new Date(year.startDate)
          .toISOString()
          .split("T")[0];
      }
      if (typeof year.endDate === "number") {
        patches.endDate = new Date(year.endDate).toISOString().split("T")[0];
      }
      if (Object.keys(patches).length > 0) {
        await ctx.db.patch(year._id, patches);
        yearsMigrated++;
      }
    }

    // 2. Terms (startDate, endDate)
    const terms = await ctx.db.query("terms").collect();
    let termsMigrated = 0;
    for (const term of terms) {
      const patches: any = {};
      if (typeof term.startDate === "number") {
        patches.startDate = new Date(term.startDate)
          .toISOString()
          .split("T")[0];
      }
      if (typeof term.endDate === "number") {
        patches.endDate = new Date(term.endDate).toISOString().split("T")[0];
      }
      if (Object.keys(patches).length > 0) {
        await ctx.db.patch(term._id, patches);
        termsMigrated++;
      }
    }

    // 3. Discipline Logs (date)
    const discipline = await ctx.db.query("disciplineLogs").collect();
    let disciplineMigrated = 0;
    for (const log of discipline) {
      if (typeof log.date === "number") {
        await ctx.db.patch(log._id, {
          date: new Date(log.date).toISOString().split("T")[0],
        });
        disciplineMigrated++;
      }
    }

    // 4. Assessments (date)
    const assessments = await ctx.db.query("assessments").collect();
    let assessmentsMigrated = 0;
    for (const a of assessments) {
      if (typeof a.date === "number") {
        await ctx.db.patch(a._id, {
          date: new Date(a.date).toISOString().split("T")[0],
        });
        assessmentsMigrated++;
      }
    }

    // 5. SEN Assessments (date)
    const sen = await ctx.db.query("senAssessments").collect();
    let senMigrated = 0;
    for (const s of sen) {
      if (typeof s.date === "number") {
        await ctx.db.patch(s._id, {
          date: new Date(s.date).toISOString().split("T")[0],
        });
        senMigrated++;
      }
    }

    // 6. Student Profiles (dateOfBirth)
    const profiles = await ctx.db.query("studentProfiles").collect();
    let profilesMigrated = 0;
    for (const p of profiles) {
      if (typeof p.dateOfBirth === "number") {
        await ctx.db.patch(p._id, {
          dateOfBirth: new Date(p.dateOfBirth).toISOString().split("T")[0],
        });
        profilesMigrated++;
      }
    }

    // 7. Attendance (date)
    const attendance = await ctx.db.query("attendance").collect();
    let attendanceMigrated = 0;
    for (const att of attendance) {
      if (typeof att.date === "number") {
        await ctx.db.patch(att._id, {
          date: new Date(att.date).toISOString().split("T")[0],
        });
        attendanceMigrated++;
      }
    }

    return {
      success: true,
      migrated: {
        academicYears: yearsMigrated,
        terms: termsMigrated,
        disciplineLogs: disciplineMigrated,
        assessments: assessmentsMigrated,
        senAssessments: senMigrated,
        studentProfiles: profilesMigrated,
        attendance: attendanceMigrated,
      },
    };
  },
});
