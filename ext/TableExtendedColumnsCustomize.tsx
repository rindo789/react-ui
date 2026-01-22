import React, { Component } from 'react';
import request from '@hubleto/react-ui/core/Request';
import TableExtended, { TableExtendedProps, TableExtendedState } from './TableExtended';

export interface TableExtendedColumnsCustomizeProps {
  tableModel: string,
  tableTag: string,
  onClose: any,
  parentTable: TableExtended<TableExtendedProps,TableExtendedState>,
}

export interface TableExtendedColumnsCustomizeState {
  record: any,
  draggedKey: null,
}

export default class TableExtendedColumnsCustomize<P, S> extends Component {

  props: TableExtendedColumnsCustomizeProps;
  state: TableExtendedColumnsCustomizeState;

  constructor(props: TableExtendedColumnsCustomizeProps) {
    super(props);
    this.state = {
      record: null,
      draggedKey: null,
    };
  }

  componentDidMount(): void {
    this.loadRecord();
  }

  loadRecord(): void {
    request.get(
      "api/get-table-columns-customize",
      {
        model: this.props.tableModel,
        tag: this.props.tableTag,
      },
      (res: any) => {
        if (res.status == "success") {
          this.setState({ record: res.data });
        }
      }
    );
  }

  saveRecord(): void {
    request.post(
      "api/save-table-columns-customize",
      {
        record: this.state.record,
        model: this.props.tableModel,
        tag: this.props.tableTag,
      },
      {},
      (data: any) => {
        if (data.status == "success") {
          this.props.onClose();
          this.props.parentTable.loadTableDescription();
        }
      }
    );
  }

  resetRecord(): void {
    request.post(
      "api/reset-table-columns-customize",
      {
        record: this.state.record,
        model: this.props.tableModel,
        tag: this.props.tableTag,
      },
      {},
      (data: any) => {
        if (data.status == "success") {
          this.props.onClose();
          this.props.parentTable.loadTableDescription();
        }
      }
    );
  }

  onDragStart = (e, key) => {
    this.setState({ draggedKey: key });
    e.dataTransfer.effectAllowed = "move";
  };

  onDragOver = (e, key) => {
    e.preventDefault();
    const { draggedKey, record } = this.state;
    if (draggedKey === key) return;

    let entries = Object.entries(record);

    const draggedIdx = entries.findIndex(([k]) => k === draggedKey);
    const targetIdx = entries.findIndex(([k]) => k === key);

    const [removed] = entries.splice(draggedIdx, 1);
    entries.splice(targetIdx, 0, removed);

    const newItems = Object.fromEntries(entries);
    this.setState({ record: newItems });
  };

  onDrop = (e) => {
    e.preventDefault();
    this.setState({ draggedKey: null });
  };

  renderTitle(): JSX.Element {
    return <>Customize Columns</>;
  }

  render(): JSX.Element {
    return (
      <>
        <div className="modal-header active">
          <div className="modal-header-left">
            <button className="btn btn-add" onClick={() => this.saveRecord()}>
              <span className="icon">
                <i className="fas fa-save"></i>
              </span>
              <span className="text">Save</span>
            </button>
          </div>
          <div className="modal-header-title">
            <h2>Customize Columns</h2>
          </div>
          <div className="modal-header-right">
            <button
              className="btn btn-close"
              type="button"
              aria-label="Close"
              onClick={this.props.onClose}
            >
              <span className="icon">
                <i className="fas fa-xmark"></i>
                <span className="shortcut">Esc</span>
              </span>
            </button>
          </div>
        </div>
        <div className='modal-body'>
          {this.state.record ? <div className="p-2 flex flex-col gap-2">
            {Object.entries(this.state.record).map(
              //@ts-ignore
              ([key, { title, is_hidden }]) => (
                <div
                  className="w-[100%]"
                  key={key}
                  draggable
                  onDragStart={(e) => this.onDragStart(e, key)}
                  onDragOver={(e) => this.onDragOver(e, key)}
                  onDrop={this.onDrop}
                >
                  <button
                    className={`btn btn-transparent w-[100%]`}
                    onClick={() =>
                      this.setState((prevState) => ({
                        record: {
                          //@ts-ignore
                          ...prevState.record,
                          [key]: {
                            //@ts-ignore
                            ...prevState.record[key],
                            //@ts-ignore
                            is_hidden: !prevState.record[key].is_hidden,
                          },
                        },
                      }))
                    }
                  >
                    <div className='flex flex-row items-center'>
                      <span className="icon">
                        <i className={`text-gray-500 fa fa-ellipsis-vertical`}></i>
                      </span>
                      <span className="icon">
                        <input type="checkbox" checked={!is_hidden} />
                      </span>
                      <span className="text">{title}</span>
                    </div>
                  </button>
                </div>
              )
            )}
          </div> : null}
        </div>
        <div className='modal-footer'>
          <button className="btn btn-transparent" onClick={() => this.resetRecord()}>
            <span className="icon"><i className="fas fa-refresh"></i></span>
            <span className="text">Reset to default</span>
          </button>
        </div>
      </>
    );
  }
}
