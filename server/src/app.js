import express from "express";
import path from "path";
import logger from "morgan";
import moment from "moment";

import fs from "fs";
import bluebird from "bluebird";
bluebird.promisifyAll(fs);

import config from "./config";

const public_folder = path.resolve("../public");
const app = express();

app.use(logger(config.logging_format));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(public_folder));

function getDateRange(start, end) {
  const dates = [];

  let currentDate = moment(start);
  let stopDate = moment(end);

  while (currentDate <= stopDate) {
    dates.push(moment(currentDate).format("YYYY-MM-DD"));
    currentDate = moment(currentDate).add(1, "days");
  }

  return dates;
}

app.get("/report", async (req, res) => {
  const start = req.query.start;
  const end = req.query.end;
  console.log(start);
  console.log(end);

  const startDate = moment(start, "YYYY-MM-DD");
  const endDate = moment(end, "YYYY-MM-DD");

  const dates = getDateRange(startDate, endDate);
  console.log(dates);

  const data = [];
  // Build an excel spreadsheet
  for (let date of dates) {
    const dateData = {};
    const folder_dir = path.join("logs", date);
    const files = fs.readdirSync(folder_dir);

    for (let file of files) {
      const file_dir = path.join(folder_dir, file);
      dateData[file] = fs.readFileSync(file_dir, "utf8");
    }
    data.push(dateData);
  }

  res.send(data);
});

app.post("/log", async (req, res) => {
  const type = req.body.type;
  const time = req.body.time;
  console.log(req.body);
  console.log(type);
  console.log(time);

  const date = new Date();
  const folder_name = `${date.toISOString().split("T")[0]}`;
  const folder_dir = path.join("logs", folder_name);

  if (fs.existsSync("logs") == false) {
    fs.mkdirSync("logs");
  }

  if (fs.existsSync(folder_dir) == false) {
    fs.mkdirSync(folder_dir);
    q;
  }

  let file_path = path.join(folder_dir, type);
  fs.appendFileSync(file_path, `${time}\n`);

  const folder = res.status(201);
  res.send({ type, time });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(public_folder, "index.html"));
});

export default app;
