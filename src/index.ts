import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import testRoutes from "./routes/test.routes";

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/test", testRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Fuel Backend API Running");
});
app.get("/ping", (req, res) => {
  console.log("ping hit");
  res.json({ message: "pong" });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});