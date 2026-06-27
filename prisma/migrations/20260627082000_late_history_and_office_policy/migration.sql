-- Add missing office policy fields used by Office Settings.
ALTER TABLE "Office"
ADD COLUMN IF NOT EXISTS "officeStartTime" TEXT NOT NULL DEFAULT '10:00',
ADD COLUMN IF NOT EXISTS "officeEndTime" TEXT NOT NULL DEFAULT '19:00',
ADD COLUMN IF NOT EXISTS "graceMinutes" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN IF NOT EXISTS "fullDayHours" DOUBLE PRECISION NOT NULL DEFAULT 8,
ADD COLUMN IF NOT EXISTS "halfDayHours" DOUBLE PRECISION NOT NULL DEFAULT 4,
ADD COLUMN IF NOT EXISTS "workingDays" TEXT NOT NULL DEFAULT 'Monday,Tuesday,Wednesday,Thursday,Friday',
ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata';

-- Create late attendance history used by the Late History page.
CREATE TABLE IF NOT EXISTS "LateAttendance" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "attendanceId" INTEGER,
    "lateDate" TIMESTAMP(3) NOT NULL,
    "clockIn" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LateAttendance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LateAttendance_attendanceId_key"
ON "LateAttendance"("attendanceId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'LateAttendance_employeeId_fkey'
  ) THEN
    ALTER TABLE "LateAttendance"
    ADD CONSTRAINT "LateAttendance_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'LateAttendance_attendanceId_fkey'
  ) THEN
    ALTER TABLE "LateAttendance"
    ADD CONSTRAINT "LateAttendance_attendanceId_fkey"
    FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
