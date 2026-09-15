import express from "express";
import cors from "cors";
import experimentRouter from "./routes/experiment";

const app = express();

const PORT = 5001;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "ResearchPilot API is running"
  });
});

app.use("/api/experiment", experimentRouter);

app.listen(PORT, () => {
  console.log(`ResearchPilot API running on port ${PORT}`);
});