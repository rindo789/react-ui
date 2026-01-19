import React, { Component, createRef } from "react";
import Form, { FormProps, FormState } from "@hubleto/react-ui/core/Form";
import InputFile from "@hubleto/react-ui/core/Inputs/File";
import request from "@hubleto/react-ui/core/Request";

export interface TableExtendedImportCsvFormProps extends FormProps {}
export interface TableExtendedImportCsvFormState extends FormState {
  csvData: string,
  testResult?: any,
  importResult?: any,
}

export default class TableExtendedImportCsvForm<P, S> extends Form<TableExtendedImportCsvFormProps,TableExtendedImportCsvFormState> {
  static defaultProps: any = {
    ...Form.defaultProps
  };

  props: TableExtendedImportCsvFormProps;
  state: TableExtendedImportCsvFormState;

  refCsvFileInput: any;

  constructor(props: TableExtendedImportCsvFormProps) {
    super(props);
    this.refCsvFileInput = createRef();

    this.state = {
      ...this.getStateFromProps(props),
      csvData: '',
      testResult: null,
      importResult: null,
    };
  }

  renderTitle(): JSX.Element {
    return <>
      <h2>{this.translate('Import to CSV')}</h2>
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

  renderContent(): JSX.Element {
    const csvImportEndpointParams = this.props.parentTable.getCsvImportEndpointParams();

    if (this.props.parentTable.props.parentForm && !csvImportEndpointParams) {
      return <div className='alert alert-danger'>
        This table does not support CSV import in nested forms.
      </div>;
    } else {
      return <div className="p-2">
        <div className="alert alert-info">
          How to import:
          <ul>
            <li className="ml-2">• Prepare your CSV file. Read <a href="" target="_blank" className="btn btn-transparent">{this.translate('this guide')}</a> to learn how the CSV file shall be structured.</li>
            <li className="ml-2">• Upload the CSV file.</li>
            <li className="ml-2">• Start the import by clicking on "Import from CSV" button.</li>
          </ul>
        </div>
        <div style={{zoom: 2}}>
          <InputFile
            uid={this.props.parentTable.uid + '_import_csv_file'}
            ref={this.refCsvFileInput}
            onChange={(input: any, value: any) => {
              this.setState({csvData: value.fileData ?? ''});
              request.post(
                "api/table-import-csv",
                {
                  ...csvImportEndpointParams,
                  testImport: true,
                  csvData: value.fileData ?? '',
                },
                {},
                (result: any) => {
                  this.setState({testResult: result})
                }
              );
            }}
            uploadButtonText='Select CSV file'
            acceptType={['csv']}
          />
        </div>

        {this.state.testResult && this.state.testResult.foundRecords ? <>
          <div className='mt-2'>
            <div>{this.translate('Found following records')}</div>
            <table className='table-default dense'>
              <thead>
                <tr>
                  {Object.keys(this.state.testResult.foundRecords[0]).map((colName) => {
                    return <td>{colName ?? ''}</td>;
                  })}
                </tr>
              </thead>
              <tbody>
                {this.state.testResult.foundRecords.map((record, index) => {
                  return <tr>
                    {Object.keys(record).map((colName) => {
                      return <td>{record[colName] ?? ''}</td>;
                    })}
                  </tr>;
                })}
              </tbody>
            </table>
            <div>CSV file size: {Math.round(this.state.csvData.length * 100 / 1024) / 100} kB</div>
            <div className='mt-2'>
              <button
                className="btn btn-large mt-2"
                onClick={() => {
                  request.post(
                    "api/table-import-csv",
                    {
                      ...csvImportEndpointParams,
                      testImport: false,
                      csvData: this.state.csvData,
                    },
                    {},
                    (result: any) => {
                      this.setState({
                        testResult: null,
                        importResult: result,
                      });
                      this.props.parentTable.reload();
                    }
                  );
                }}
              >
                <span className="icon"><i className="fas fa-download"></i></span>
                <span className="text">Run the import !</span>
              </button>
            </div>
          </div>
        </> : null}

        {this.state.importResult ? <div className='mt-2 alert alert-success'>
          Imported {this.state.importResult.importedRecords} records.
        </div> : null}
      </div>;
    }
  }

}
