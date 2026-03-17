import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import type { NextFunction, Request, Response } from "express";
import { config } from "dotenv";
import { JSONToQuery } from "jsontoquery";
config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
    exposedHeaders: ["X-session-token"],
  })
);
app.use(cookieParser());

app.post("/query", async (req: Request, res: Response) => {
  try {
    const query = req.body;
    const jsonToQuery = new JSONToQuery(query);
    const result = await jsonToQuery.execute();
    res.send(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).send({ success: false, error: error.message || "Something went wrong!" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
