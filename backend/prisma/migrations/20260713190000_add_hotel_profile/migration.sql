CREATE TABLE "hotel_profiles" (
    "id" INTEGER NOT NULL,
    "hotel_name" VARCHAR(255) NOT NULL DEFAULT '',
    "phone" VARCHAR(30) NOT NULL DEFAULT '',
    "email" VARCHAR(255) NOT NULL DEFAULT '',
    "website" VARCHAR(255) NOT NULL DEFAULT '',
    "address" VARCHAR(500) NOT NULL DEFAULT '',
    "country" VARCHAR(100) NOT NULL DEFAULT 'Việt Nam',
    "province" VARCHAR(100) NOT NULL DEFAULT '',
    "business_type" VARCHAR(150) NOT NULL DEFAULT 'Khách sạn lưu trú',
    "tax_code" VARCHAR(50) NOT NULL DEFAULT '',
    "business_license" VARCHAR(100) NOT NULL DEFAULT '',
    "owner_name" VARCHAR(255) NOT NULL DEFAULT '',
    "owner_email" VARCHAR(255) NOT NULL DEFAULT '',
    "owner_phone" VARCHAR(30) NOT NULL DEFAULT '',
    "owner_identity" VARCHAR(50) NOT NULL DEFAULT '',
    "logo_data_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "hotel_profiles_pkey" PRIMARY KEY ("id")
);

INSERT INTO "hotel_profiles" ("id", "updated_at") VALUES (1, CURRENT_TIMESTAMP);
