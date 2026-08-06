import express, { Application } from "express";
import cors, { CorsOptions } from "cors";

import userRoutes from "./routes/user.route";
import roomRoutes from "./routes/room.route";
import bookingRoutes from "./routes/booking.route";
import maintenanceRoutes from "./routes/maintenance.route";
import dashboardRoutes from "./routes/dashboard.route";
import serviceRoutes from "./routes/service.route";
import invoiceRoutes from "./routes/invoice.route";
import financeRoutes from "./routes/finance.route";
import inventoryRoutes from "./routes/inventory.route";
import customerRoutes from "./routes/customer.route";
import roleRoutes from "./routes/role.route";
import hotelProfileRoutes from "./routes/hotel-profile.route";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app: Application = express();

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "https://pms-system-iota.vercel.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    // Cho phép Postman, curl và request server-to-server
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS không cho phép origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
  ],
  optionsSuccessStatus: 204,
};

// CORS phải được khai báo trước toàn bộ routes
app.use(cors(corsOptions));

// Express 4 xử lý preflight
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

app.use("/public", express.static("public"));

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PMS API Documentation",
      version: "1.0.0",
      description: "Danh sách tất cả các đường link API của hệ thống Quản lý Khách sạn",
    },
    servers: [
      {
        url: "http://localhost:5000", // Kiểm tra lại port server của bạn
      },
    ],
  },
  // Quét tất cả file trong thư mục routes để tìm link
  apis: ["./routes/*.ts", "./backend/routes/*.ts"], 
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.get("/api-docs-json", (_req, res) => {
  res.json(swaggerDocs);
});
// API routes
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/hotel-profile", hotelProfileRoutes);

app.get("/api-docs-json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerDocs);
});
// Health check
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running...",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "PMS API is running",
  });
});

// Xử lý route không tồn tại
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "API route không tồn tại",
  });
});

// Thêm đoạn này để link /api-docs-json hoạt động
app.get("/api-docs-json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerDocs);
});



export default app;