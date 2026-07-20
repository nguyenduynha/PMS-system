CREATE INDEX "bookings_status_idx" ON "bookings"("status");
CREATE INDEX "bookings_status_check_in_date_idx" ON "bookings"("status", "check_in_date");
CREATE INDEX "bookings_created_at_idx" ON "bookings"("created_at");
CREATE INDEX "maintenance_records_status_updated_at_idx" ON "maintenance_records"("status", "updated_at");
CREATE INDEX "finance_transactions_date_idx" ON "finance_transactions"("date");
CREATE INDEX "finance_transactions_type_date_idx" ON "finance_transactions"("type", "date");
