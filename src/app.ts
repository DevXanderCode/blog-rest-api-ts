import express, { Express, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import { feedRoutes } from "./routes";

const app: Express = express();

app.use(bodyParser.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, DELETE, PUT, PATCH"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

app.listen(8080, () => {
  console.log("app listening at port 8080");
});
