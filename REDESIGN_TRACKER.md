# CoreLMS Design System Redesign Tracker

> Tracking all screens/flows redesigned to conform to the Design Language Guide.

## Design Tokens

| Status | Item                            | Notes                                                             | Date       |
| ------ | ------------------------------- | ----------------------------------------------------------------- | ---------- |
| [x]    | `globals.css` — `:root` tokens  | Replaced oklch orange palette with maroon/warm-neutral hex tokens | 2026-03-06 |
| [x]    | `app/layout.tsx` — Font loading | Switched to system fonts: Georgia (serif) + Helvetica Neue (sans) | 2026-03-06 |

## Screens & Flows

| Status | Screen                              | File(s)                                                                                  | Date       |
| ------ | ----------------------------------- | ---------------------------------------------------------------------------------------- | ---------- |
| [x]    | Auth Layout                         | `app/(auth)/layout.tsx`                                                                  | 2026-03-06 |
| [x]    | Sign In                             | `app/(auth)/sign-in/page.tsx`                                                            | 2026-03-06 |
| [x]    | Sign Up                             | `app/(auth)/sign-up/page.tsx`                                                            | 2026-03-06 |
| [x]    | Forgot Password                     | `app/(auth)/forgot-password/page.tsx`                                                    | 2026-03-06 |
| [x]    | Dashboard Layout (Header + Sidebar) | `app/dashboard/layout.tsx`, `components/app-sidebar.tsx`, `components/term-switcher.tsx` | 2026-03-06 |
| [x]    | Dashboard Home                      | `app/dashboard/page.tsx`, all 4 role dashboards                                          | 2026-03-06 |
| [ ]    | Students                            | `app/dashboard/students/page.tsx`                                                        | —          |
| [ ]    | Classes                             | `app/dashboard/classes/`                                                                 | —          |
| [ ]    | Attendance                          | `app/dashboard/attendance/page.tsx`                                                      | —          |
| [ ]    | Gradebook                           | `app/dashboard/gradebook/page.tsx`                                                       | —          |
| [ ]    | Grades                              | `app/dashboard/grades/page.tsx`                                                          | —          |
| [ ]    | Report Cards                        | `app/dashboard/report-cards/`                                                            | —          |
| [ ]    | Subjects                            | `app/dashboard/subjects/page.tsx`                                                        | —          |
| [ ]    | Terms                               | `app/dashboard/terms/page.tsx`                                                           | —          |
| [ ]    | Timetable                           | `app/dashboard/timetable/`                                                               | —          |
| [ ]    | Tracking (Behavior & SEN)           | `app/dashboard/tracking/page.tsx`                                                        | —          |
| [ ]    | SEN Support                         | `app/dashboard/sen/`                                                                     | —          |
| [ ]    | LMS / Learning                      | `app/dashboard/lms/`                                                                     | —          |
| [ ]    | Analytics                           | `app/dashboard/analytics/page.tsx`                                                       | —          |
| [ ]    | Financials                          | `app/dashboard/financials/`                                                              | —          |
| [ ]    | HR                                  | `app/dashboard/hr/`                                                                      | —          |
| [ ]    | Hostels / Boarding                  | `app/dashboard/hostels/`                                                                 | —          |
| [ ]    | Transport                           | `app/dashboard/transport/`                                                               | —          |
| [ ]    | Communication                       | `app/dashboard/communication/`                                                           | —          |
| [ ]    | Users (Admin)                       | `app/dashboard/users/page.tsx`                                                           | —          |

## Components Redesigned

| Status | Component                   | File                                        | Date       |
| ------ | --------------------------- | ------------------------------------------- | ---------- |
| [x]    | UniversalSearch             | `components/layout/UniversalSearch.tsx`     | 2026-03-06 |
| [x]    | AppSidebar                  | `components/app-sidebar.tsx`                | 2026-03-06 |
| [x]    | TermSwitcher                | `components/term-switcher.tsx`              | 2026-03-06 |
| [x]    | PageBanner (hero + compact) | `components/layout/PageBanner.tsx`          | 2026-03-06 |
| [x]    | AdminDashboard              | `components/dashboard/AdminDashboard.tsx`   | 2026-03-06 |
| [x]    | TeacherDashboard            | `components/dashboard/TeacherDashboard.tsx` | 2026-03-06 |
| [x]    | StudentDashboard            | `components/dashboard/StudentDashboard.tsx` | 2026-03-06 |
| [x]    | ParentDashboard             | `components/dashboard/ParentDashboard.tsx`  | 2026-03-06 |
