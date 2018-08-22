import mongodb from "mongodb";
import moment from "moment";

const DB_URL = "mongodb://localhost:27017";
const DB_NAME = "trafficlog";

export default async function logEntry(type, time, data) {
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
