import express from "express";
import path from "path";
import logger from "morgan";
import moment from "moment";

import mongodb from "mongodb";

import bluebird from "bluebird";

import xl from "excel4node";

import fs from "fs";
bluebird.promisifyAll(fs);

import config from "./config";

const DB_URL = "mongodb://localhost:27017";
const DB_NAME = "trafficlog";

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
    // TODO: Don't use keys, make the object keep its name
    for (let type of Object.keys(items)) {
      // Title of types
      ws.cell(2, distance_from_left + types, 2, distance_from_left + types)
        .string(type)
        .style(typeStyle);

      let entries = 0;
      for (let entry of items[type]) {
        // Each individual time

        let time = moment(entry.time);

        ws.cell(
          3 + entries,
          distance_from_left + types,
          3 + entries,
          distance_from_left + types
        ).string(`${time.format("hh:mm A")}`);

        entries += 1;
      }
      types += 1;
    }
    distance_from_left += length + 1;
  }
  return wb;
}

app.get("/api/today", async (req, res) => {
  let startOfDay = moment()
    .startOf("day")
    .toISOString();
  let endOfDay = moment()
    .endOf("day")
    .toISOString();

  let client;

  let data;
  try {
    // Connect to the database
    client = await mongodb.MongoClient.connect(DB_URL);
    const db = client.db(DB_NAME);
    const collection = db.collection("entries");

    const entries = await collection
      .find({
        time: { $gt: new Date(startOfDay), $lt: new Date(endOfDay) }
      })
      .sort({ time: 1 })
      .toArray();

    data = entries;
  } catch (err) {
    console.log(err.stack);
  }

  if (client) {
    client.close();
  }

  res.send(data);
});

app.get("/report", async (req, res) => {
  const start = req.query.start;
  const end = req.query.end;
  console.log(start);
  console.log(end);

  const startDate = moment(start, "YYYY-MM-DD");
  const endDate = moment(end, "YYYY-MM-DD");

  const dates = getDateRange(startDate, endDate);
  console.log(dates);

  let client;

  const data = [];
  try {
    client = await mongodb.MongoClient.connect(DB_URL);

    const db = client.db(DB_NAME);
    const collection = db.collection("entries");

    // Build an excel spreadsheet
    for (let date of dates) {
      // Find the UNIX epoch time range of the specified date, 00:00 to ~23:59.999
      // let startOfDay = moment(date, "YYYY-MM-DD").hours(0).minutes(0).seconds(0).milliseconds(0).toISOString();
      let startOfDay = moment(date, "YYYY-MM-DD")
        .startOf("day")
        .toISOString();
      let endOfDay = moment(date, "YYYY-MM-DD")
        .endOf("day")
        .toISOString();
      // let endOfDay = moment(date, "YYYY-MM-DD").hours(0).minutes(0).seconds(0).milliseconds(0).add(1, "d").toISOString();

      console.log(`Looking for dates between ${startOfDay} and ${endOfDay}`);
      // Should lump all entries into a single collection and add a type field
      // For now, there is just a call and desk collection
      const types = ["desk", "call"];

      const desk_entries = await collection
        .find({
          type: "desk",
          time: { $gt: new Date(startOfDay), $lt: new Date(endOfDay) }
        })
        .sort({ time: 1 })
        .toArray();
      console.log(`Desk: ${JSON.stringify(desk_entries)}`);
      const call_entries = await collection
        .find({
          type: "call",
          time: { $gt: new Date(startOfDay), $lt: new Date(endOfDay) }
        })
        .sort({ time: 1 })
        .toArray();
      console.log(`Call: ${JSON.stringify(call_entries)}`);

      const dateData = {
        items: { call: call_entries, desk: desk_entries },
        date
      };

      data.push(dateData);
    }
  } catch (err) {
    console.log(err.stack);
  }

  if (client) {
    client.close();
  }

  const name = `2Fix Traffic Report: ${startDate} to ${endDate}`;

  let wb = createSpreadsheet(data, name);
  wb.write(name, res);
  // res.send(200);
});

app.post("/api/scan", async (req, res) => {
  const number = req.body.number;
  const time = req.body.time;

  log("desk", time, { number });

  res.sendStatus(201);
});

/*
function logDesk(number, time) {}

function logCall(time) {}
*/

async function log(type, time, data) {
  /*
  switch (type) {
    case "desk":
      return logDesk(data.number, time);
    case "call":
      return logCall(time);
  }
  */
  let client;

  console.log(
    `Attempting to log type: ${type} at ${time} with payload: ${data}`
  );

  try {
    client = await mongodb.MongoClient.connect(DB_URL);

    const db = client.db(DB_NAME);

    const entry = await db
      .collection("entries")
      .insertOne({ type: type, time: moment(time).toDate(), data: data });
  } catch (err) {
    console.log(err.stack);
  }

  if (client) {
    client.close();
  }
}

app.post("/log", async (req, res) => {
  const type = req.body.type;
  const time = req.body.time;
  console.log(req.body);
  console.log(type);
  console.log(time);
  log(type, time);

  /*
  const date = new Date();
  const folder_name = `${date.toISOString().split("T")[0]}`;
  const folder_dir = path.join("logs", folder_name);

  const logs_exists = fs.existsSync("logs");

  if (logs_exists == false) {
    fs.mkdirSync("logs");
  }

  const folder_exists = fs.existsSync(folder_dir);
  if (folder_exists == false) {
    fs.mkdirSync(folder_dir);
  }

  let file_path = path.join(folder_dir, type);
  fs.appendFileSync(file_path, `${time}\n`);
  // fs.appendFileSync(file_path, `${time}\n`);

  const folder = res.status(201);
  res.send({ type, time });
  */
  res.sendStatus(201);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(public_folder, "index.html"));
});

export default app;
