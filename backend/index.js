const express = require("express");
const cors = require("cors");

const app = express();
const Port = 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Backend is running ");
});

// Example API route
app.get("/api/data", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// Server start
app.listen(Port, () => {
  console.log(`Server running on http://localhost:${Port}`);
});
