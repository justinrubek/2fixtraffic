import React from "react";

import Entry from "./Entry";

import style from "./style.css";

export default class EntryDisplay extends React.Component {
  render() {
    const { entries, types, onChange } = this.props;

    const rows = types.map(type => {
      const type_entries = entries[type].map(entry => {
        return <Entry time={entry.time} id={entry._id} onChange={onChange} />;
      });

      return (
        <div className={style.row_group}>
          <div className={style.row_title}>{type}</div>
          <ul className={style.row}>{type_entries}</ul>
        </div>
      );
    });

    return (
      <div>
        <div className={style.row_wrapper}>{rows}</div>
      </div>
    );
  }
}
