import express from "express";
import path from "path";
import logger from "morgan";
import moment from "moment";

import bluebird from "bluebird";

import xl from "excel4node";

import fs from "fs";
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

function createSpreadsheet(data) {
  let wb = new xl.Workbook();
  let ws = wb.addWorksheet("Traffic Report");

  let dayStyle = {
    font: {
      bold: true,
      color: "#0000FF",
      underline: true,
      size: 14
    },
    alignment: {
      horizontal: "center"
    }
  };

  let typeStyle = wb.createStyle({
    font: {
      size: 14
    },
    alignment: {
      horizontal: "center"
    },
    border: {
      bottom: {
        style: "thin"
      }
    }
  });

  let distance_from_left = 1;

  for (let dateData of data) {
    const items = dateData.items;
    const length = Object.keys(items).length;
    const end_cell_num = distance_from_left + length - 1;

    const displayDate = moment(dateData.date, "YYYY-MM-DD").format(
      "dddd[,] DD MMM YYYY"
    );

    // Manually position elements
    ws.cell(1, distance_from_left, 1, end_cell_num, true)
      .string(displayDate)
      .style(dayStyle);

    let types = 0;
    for (let type of Object.keys(items)) {
      // Title of types
      ws.cell(2, distance_from_left + types, 2, distance_from_left + types)
        .string(type)
        .style(typeStyle);

      let entries = 0;
      for (let entry of items[type]) {
        // Each individual time

        ws.cell(
          3 + entries,
          distance_from_left + types,
          3 + entries,
          distance_from_left + types
        ).string(entry);

        entries += 1;
      }
      types += 1;
    }
    distance_from_left += length + 1;
  }
  return wb;
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
    const dateData = { items: {}, date };
    const folder_dir = path.join("logs", date);
    if (!fs.existsSync(folder_dir)) {
      continue;
    }
    const files = fs.readdirSync(folder_dir);

    for (let file of files) {
      const file_dir = path.join(folder_dir, file);
      if (fs.existsSync(file_dir)) {
        dateData.items[file] = fs.readFileSync(file_dir, "utf8").split("\n");
      } else {
        dateData.items[file] = [];
      }
    }
    data.push(dateData);
  }

  const name = `${new Date().getTime()}.xlsx`;
  let wb = createSpreadsheet(data, name);

  wb.write(name, res);
  // res.send(200);
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
