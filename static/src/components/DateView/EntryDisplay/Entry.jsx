import React from "react";
import moment from "moment";
import axios from "axios";

import style from "./style.css";

export default class Entry extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);

    this.state = {
      expanded: false
    };
  }

  onClick(new_expanded_val) {
    this.setState({ expanded: new_expanded_val });
    if (this.props.onClick != null) {
      this.props.onClick(!expanded);
    }
  }

  render() {
    let expanded = false;
    if (this.props.expanded != null) {
      expanded = this.props.expanded;
    } else {
      expanded = this.state.expanded;
    }

    const basic_display = (
      <div key={this.props.id} onClick={() => this.onClick(!expanded)}>
        {moment(this.props.time).format("hh:mm A")}
        <button
          className={`${style.remove_button} ${style.no_select}`}
          onClick={async e => {
            e.stopPropagation();
            let del = await axios.delete(`/api/entries/${this.props.id}`);
            this.props.onChange();
          }}
        >
          x
        </button>
      </div>
    );

    // Perhaps we need to change to always rendering this, and controlling the styling?
    let expanded_display = null;
    if (expanded) {
      if (this.props.data != null) {
        let data = [];
        for (let name of Object.keys(this.props.data)) {
          data.push(
            <li key={name} className={style.data_group}>
              <div key="data_name" className={style.data_title}>
                {name}
              </div>
              <div key="data_value" className={style.data_content}>
                {this.props.data[name]}
              </div>
            </li>
          );
        }

        expanded_display = (
          <div className={style.expansion}>
            <ul className={style.list_no_bullet}>{data}</ul>
          </div>
        );
      } else {
        expanded_display = <p className={style.expansion}>No other data</p>;
      }
    }
    return (
      <div className={style.cell}>
        {basic_display}
        {expanded_display}
      </div>
    );
  }
}
