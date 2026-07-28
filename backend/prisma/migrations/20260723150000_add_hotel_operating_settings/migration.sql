ALTER TABLE "hotel_profiles"
  ADD COLUMN "default_check_in_time" VARCHAR(5) NOT NULL DEFAULT '14:00',
  ADD COLUMN "default_check_out_time" VARCHAR(5) NOT NULL DEFAULT '12:00',
  ADD COLUMN "free_cancellation_hours" INTEGER NOT NULL DEFAULT 24,
  ADD COLUMN "allow_early_check_in" BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN "allow_late_check_out" BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN "early_check_in_fee" DECIMAL(12,2) NOT NULL DEFAULT 100000,
  ADD COLUMN "late_check_out_fee" DECIMAL(12,2) NOT NULL DEFAULT 150000,
  ADD COLUMN "extra_guest_fee" DECIMAL(12,2) NOT NULL DEFAULT 200000;
