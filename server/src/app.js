import express from "express";
import path from "path";
import logger from "morgan";
import moment from "moment";

import bluebird from "bluebird";

import config from "./config";
import api from "./api";

const DB_URL = "mongodb://localhost:27017";
const DB_NAME = "trafficlog";

const public_folder = path.resolve(__dirname, "..", "..", "public");
const app = express();

app.use(logger(config.logging_format));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(public_folder));

app.use("/api", api);

app.get("*", (req, res) => {
  console.log("Default route");
  res.sendFile(path.join(public_folder, "index.html"));
});

export default app;
