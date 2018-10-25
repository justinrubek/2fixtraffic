import express from "express";
import mongodb from "mongodb";
import moment from "moment";

import entries from "./entries";

import createSpreadsheet from "./createSpreadsheet";
import getDateRange from "./getDateRange";
import logEntry from "./logEntry";

const router = express.Router();

const DB_URL = "mongodb://localhost:27017";
const DB_NAME = "trafficlog";

router.use(function timelog(req, res, next) {
  console.log(`API access at ${Date.now()} from ${req.ip}`);
  next();
});

router.get("/today", async (req, res) => {
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

router.get("/report", async (req, res) => {
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

router.post("/scan", async (req, res) => {
  const number = req.body.number;
  const type = req.body.type;

  logEntry(type, new Date(), { number });

  res.sendStatus(201);
});

router.post("/log", async (req, res) => {
  const type = req.body.type;
  const time = req.body.time;
  console.log(req.body);
  console.log(type);
  console.log(time);
  logEntry(type, time);

  res.sendStatus(201);
});

router.use("/entries", entries);

export default router;
