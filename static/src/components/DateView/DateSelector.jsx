import React from "react";

export default class DateSelector extends React.Component {
  render() {
    return (
      <input
        type="date"
        value={this.props.value}
        onChange={e => this.props.onSelect(e.target.value)}
      />
    );
  }
}
