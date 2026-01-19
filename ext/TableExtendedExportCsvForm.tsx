import React, { Component } from "react";
import Form, { FormDescription, FormProps, FormState } from "@hubleto/react-ui/core/Form";

export interface TableExtendedExportCsvFormProps extends FormProps {}
export interface TableExtendedExportCsvFormState extends FormState {
  separator: string,
}

export default class TableExtendedExportCsvForm<P, S> extends Form<TableExtendedExportCsvFormProps,TableExtendedExportCsvFormState> {
  static defaultProps: any = {
    ...Form.defaultProps
  };

  props: TableExtendedExportCsvFormProps;
  state: TableExtendedExportCsvFormState;

  constructor(props: TableExtendedExportCsvFormProps) {
    super(props);

    this.state = this.getStateFromProps(props);
  }

  getStateFromProps(props: TableExtendedExportCsvFormProps) {
    return {
      separator: ',',
      ...super.getStateFromProps(props),
    };
  }


  renderTitle(): JSX.Element {
    return <>
      <h2>{this.translate('Export to CSV')}</h2>
      <small>{this.props.model}</small>
    </>;
  }

  renderWarningsOrErrors(): null|JSX.Element {
    return null;
  }

  renderFooter(): JSX.Element {
    return <></>;
  }

  renderHeaderLeft(): JSX.Element {
    return <></>;
  }

  renderHeaderRight(): JSX.Element {
    return this.renderCloseButton();
  }

  getExportParams() {
    return {
      separator: this.state.separator,
      ... this.props.parentTable.getEndpointParams(),
    }
  }

  renderContent(): JSX.Element {
    const qs = require('qs');
    return <div className="p-2">
      <div className="alert alert-info">
        A CSV file with the following columns and {this.props.parentTable.state?.data?.total} items will be generated
      </div>
      <table className="table-default dense mt-2">
        <thead>
          <th>{this.translate('Column')}</th>
          <th>{this.translate('Type')}</th>
        </thead>
        <tbody>
          {Object.keys(this.props.parentTable.state.description.columns).map((columnName) => {
            const column = this.props.parentTable.state.description.columns[columnName];
            return <tr>
              <td>{columnName}</td>
              <td>{column.type}</td>
            </tr>;
          })}
        </tbody>
      </table>
      {this.inputWrapper('separator', {
        value: this.state.separator,
        description: {
          title: this.translate("Separator"),
        },
        isInlineEditing: true,
        onChange: (input: any, value: string) => {
          this.setState({ separator: value });
        }
      })}
      <a
        className="btn btn-large mt-2"
        href={globalThis.hubleto.config.projectUrl + "/api/table-export-csv?" + qs.stringify(this.getExportParams(), { arrayFormat: 'brackets' })}
        target="_blank"
      >
        <span className="icon"><i className="fas fa-download"></i></span>
        <span className="text">{this.translate('Export to CSV')}</span>
      </a>
    </div>;
  }

}
