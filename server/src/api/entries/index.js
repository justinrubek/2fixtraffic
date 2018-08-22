import express from "express";
import moment from "moment";
import mongodb from "mongodb";

const router = express.Router();
export default router;

const DB_URL = "mongodb://localhost:27017";
const DB_NAME = "trafficlog";

router.get("/", async (req, res) => {
  // Don't send all entries, only if they specify a date
  let startOfDay = moment(req.query.date, "YYYY-MM-DD")
    .startOf("day")
    .toISOString();
  let endOfDay = moment(req.query.date, "YYYY-MM-DD")
    .endOf("day")
    .toISOString();

  // const displayDate = moment(dateData.date, "YYYY-MM-DD");
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

router.delete("/:id", async (req, res) => {
  let client;
  let result;

  try {
    // Connect to the database
    client = await mongodb.MongoClient.connect(DB_URL);
    const db = client.db(DB_NAME);
    const collection = db.collection("entries");

    result = await collection.deleteOne({
      _id: new mongodb.ObjectID(req.params.id)
    });
  } catch (err) {
    console.log(err.stack);
  }

  if (client) {
    client.close();
  }
  if (result == null || result.deletedCount == 0) {
    res.sendStatus(404);
  }
  if (result.deletedCount == 1) {
    res.sendStatus(200);
  } else {
    res.sendStatus(500);
  }
});
