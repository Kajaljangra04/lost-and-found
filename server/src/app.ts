import path from "path";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./app/routes/routes";
import errorHandler from "./app/midddlewares/errorHandler";

dotenv.config();

const app: Application = express();

app.use(
  cors({
    origin: ["http://localhost:5173", `${process.env.CLIENT_URL}`],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(path.resolve(process.cwd(), "uploads"), {
    dotfiles: "deny",
    index: false,
    fallthrough: false,
    maxAge: "1d",
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Welcome to Lost and found services!" });
});

app.use("/api", router);
app.use(errorHandler);

app.use((req: Request, res: Response) => {
  res.status(404).send({
    statusCode: 404,
    success: false,
    message: "Sorry, We can't find that!",
  });
});

export default app;
