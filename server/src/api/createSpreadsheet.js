import xl from "excel4node";
import moment from "moment";

export default function createSpreadsheet(entry_data) {
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

  for (let dateData of entry_data) {
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
