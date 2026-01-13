import React, { Component } from 'react'
import { TableCellRenderer, TableCellRendererProps, TableCellRendererState } from '../TableCellRenderer'

export default class SharedWithTableCellRenderer extends TableCellRenderer<TableCellRendererProps, TableCellRendererState> {
  render() {
    if (this.state.data && this.state.data[this.state.columnName]) {
      let valuesPerUser = {};

      try {
        valuesPerUser = JSON.parse(this.state.data[this.state.columnName]);
      } catch (ex) {
        valuesPerUser = {};
      }

      Object.keys(valuesPerUser).map((idUser: any) => {
        if (valuesPerUser[idUser] != 'read' && valuesPerUser[idUser] != 'modify') {
          delete valuesPerUser[idUser];
        }
      })

      let userCount = Object.keys(valuesPerUser).length;

      if (userCount > 0) return <><i className='fas fa-share-nodes pr-2'></i> {userCount} user(s)</>;
      else return null;
    } else {
      return null;
    }
  }
}
