export interface GradingResult {
  grade: string;
  score: number;
  outOf: number;
  percentage: number;
  color: string; // Tailwind color semantic for UI
}

export type GradingScaleType =
  | "primary"
  | "junior_secondary"
  | "senior_secondary";

/**
 * Zambian Primary School Grading Scale (Grades 1-7)
 * Based on 150 points total scale.
 */
export function calculatePrimaryGrade(
  score: number,
  outOf: number,
): GradingResult {
  const percentage = Math.round((score / outOf) * 100);
  const normalizedScore = (score / outOf) * 150; // Scale to 150 for division criteria

  let grade = "F (Below Average)";
  let color = "red";
  if (normalizedScore >= 112) {
    grade = "Division One";
    color = "green";
  } else if (normalizedScore >= 90) {
    grade = "Division Two";
    color = "green";
  } else if (normalizedScore >= 75) {
    grade = "Division Three";
    color = "amber";
  } else if (normalizedScore >= 40) {
    grade = "Division Four";
    color = "amber";
  }

  return { grade, score, outOf, percentage, color };
}

/**
 * Zambian Junior Secondary Grading Scale (Grades 8-9, JSSLE)
 * Based on percentage letter grading.
 */
export function calculateJuniorSecondaryGrade(
  score: number,
  outOf: number,
): GradingResult {
  const percentage = Math.round((score / outOf) * 100);

  let grade = "Fail";
  let color = "red";
  if (percentage >= 75) {
    grade = "Distinction";
    color = "green";
  } else if (percentage >= 60) {
    grade = "Merit";
    color = "green";
  } else if (percentage >= 50) {
    grade = "Credit";
    color = "amber";
  } else if (percentage >= 40) {
    grade = "Pass";
    color = "amber";
  }

  return { grade, score, outOf, percentage, color };
}

/**
 * Zambian Senior Secondary Grading Scale (Grades 10-12, ECZ O-Level)
 * Based on 1-9 Numeric scale.
 */
export function calculateSeniorSecondaryGrade(
  score: number,
  outOf: number,
): GradingResult {
  const percentage = Math.round((score / outOf) * 100);

  let grade = "9 (Fail)";
  let color = "red";
  if (percentage >= 75) {
    grade = "1 (Distinction)";
    color = "green";
  } else if (percentage >= 70) {
    grade = "2 (Distinction)";
    color = "green";
  } else if (percentage >= 65) {
    grade = "3 (Merit)";
    color = "green";
  } else if (percentage >= 60) {
    grade = "4 (Merit)";
    color = "green";
  } else if (percentage >= 55) {
    grade = "5 (Credit)";
    color = "amber";
  } else if (percentage >= 50) {
    grade = "6 (Credit)";
    color = "amber";
  } else if (percentage >= 45) {
    grade = "7 (Satisfactory)";
    color = "amber";
  } else if (percentage >= 40) {
    grade = "8 (Satisfactory)";
    color = "amber";
  }

  return { grade, score, outOf, percentage, color };
}

/**
 * Dynamically routing grading calculation based on the configured scale type.
 */
export function calculateGrade(
  score: number,
  outOf: number,
  scaleType: GradingScaleType,
): GradingResult {
  if (outOf === 0)
    return { grade: "N/A", score: 0, outOf: 0, percentage: 0, color: "slate" };

  if (scaleType === "primary") return calculatePrimaryGrade(score, outOf);
  if (scaleType === "junior_secondary")
    return calculateJuniorSecondaryGrade(score, outOf);
  if (scaleType === "senior_secondary")
    return calculateSeniorSecondaryGrade(score, outOf);

  // default fallback to percentage
  const percentage = Math.round((score / outOf) * 100);
  return { grade: `${percentage}%`, score, outOf, percentage, color: "blue" };
}
