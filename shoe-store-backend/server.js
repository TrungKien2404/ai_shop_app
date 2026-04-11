const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const config = require("./config/env");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Shoe shop API",
    routes: ["/api/auth", "/api/products", "/api/orders"],
  });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// Error handler (optional)
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

async function startServer() {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);

    if (!config.envFileExists) {
      console.log("Khong tim thay .env, backend dang dung cau hinh mac dinh cho development.");
    }
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${config.port} dang duoc mot tien trinh khac su dung.`);
      console.error(`Hay tat tien trinh cu hoac doi PORT trong .env roi chay lai.`);
      return process.exit(1);
    }

    console.error("Server start error:", error);
    process.exit(1);
  });
}

startServer();
