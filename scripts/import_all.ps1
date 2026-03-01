$tables = @(
    "tenants",
    "academicYears",
    "terms",
    "grades",
    "subjects",
    "users",
    "studentProfiles",
    "staffProfiles",
    "classes",
    "classSubjects",
    "attendance",
    "assessments",
    "assessmentMarks",
    "invoices",
    "invoiceItems",
    "payments",
    "feeTypes",
    "disciplineLogs",
    "courses",
    "lessons",
    "lmsAssignments",
    "staffAttendance",
    "payruns",
    "hostels",
    "dormitories",
    "hostelAllocations",
    "vehicles",
    "routes",
    "timetableSlots",
    "timetableEntries",
    "announcements",
    "communicationTemplates"
)

foreach ($table in $tables) {
    if (Test-Path "seed-data/$table.json") {
        Write-Host "Importing table: ${table}" -ForegroundColor Cyan
        npx convex import --table $table "seed-data/$table.json" --replace
    } else {
        Write-Host "Skipping ${table}: File not found" -ForegroundColor Yellow
    }
}

Write-Host "`nAll datasets imported successfully! 🚀" -ForegroundColor Green
Write-Host "You can now log in using the credentials in implementation_plan.md" -ForegroundColor White
