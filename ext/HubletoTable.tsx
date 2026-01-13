import React, { Component } from 'react'
import Table, { TableProps, TableState } from '@hubleto/react-ui/core/Table';
import HubletoForm, { HubletoFormProps, HubletoFormState } from './HubletoForm';
import HubletoTableExportCsvForm from './HubletoTableExportCsvForm';
import HubletoTableImportCsvForm from './HubletoTableImportCsvForm';
import { getUrlParam } from '@hubleto/react-ui/core/Helper';
import ModalForm from "@hubleto/react-ui/core/ModalForm";
import HubletoTableColumnsCustomize from './HubletoTableColumnsCustomize';
import { setUrlParam, deleteUrlParam } from "@hubleto/react-ui/core/Helper";

export interface HubletoTableProps extends TableProps {
  junctionTitle?: string,
  junctionModel?: string,
  junctionSourceColumn?: string,
  junctionDestinationColumn?: string,
  junctionSourceRecordId?: number,
  junctionSaveEndpoint?: string,
}

export interface HubletoTableState extends TableState {
  showExportCsvScreen: boolean,
  showImportCsvScreen: boolean,
  showColumnConfigScreen: boolean,
  collapsedNodeIds: Array<number>,
}

export default class HubletoTable<P, S> extends Table<HubletoTableProps, HubletoTableState> {
  static defaultProps = {
    ...Table.defaultProps,
    formUseModalSimple: true,
  }

  props: HubletoTableProps;
  state: HubletoTableState;

  refExportCsvModal: any;
  refImportCsvModal: any;
  refColumnConfigModal: any;

  refExportCsvForm: any;
  refImportCsvForm: any;
  refColumnsConfigScreen: any;

  constructor(props: HubletoTableProps) {
    super(props);

    this.refExportCsvModal = React.createRef();
    this.refImportCsvModal = React.createRef();
    this.refColumnConfigModal = React.createRef();

    this.refExportCsvForm = React.createRef();
    this.refImportCsvForm = React.createRef();
    this.refColumnsConfigScreen = React.createRef();
  }

  getStateFromProps(props: HubletoTableProps) {
    return {
      ...super.getStateFromProps(props),
      showExportCsvScreen: false,
      showImportCsvScreen: false,
      showColumnConfigScreen: false,
      collapsedNodeIds: [],
    };
  }

  getEndpointParams(): any {
    return {
      ...super.getEndpointParams(),
      junctionTitle: this.props.junctionTitle,
      junctionModel: this.props.junctionModel,
      junctionSourceColumn: this.props.junctionSourceColumn,
      junctionDestinationColumn: this.props.junctionDestinationColumn,
      junctionSourceRecordId: this.props.junctionSourceRecordId,
      junctionSaveEndpoint: this.props.junctionSaveEndpoint ?? 'api/record/save-junction',
    }
  }

  getFormProps(): any {
    return {
      ...super.getFormProps(),
      junctionTitle: this.props.junctionTitle,
      junctionModel: this.props.junctionModel,
      junctionSourceColumn: this.props.junctionSourceColumn,
      junctionDestinationColumn: this.props.junctionDestinationColumn,
      junctionSourceRecordId: this.props.junctionSourceRecordId,
      junctionSaveEndpoint: this.props.junctionSaveEndpoint ?? 'api/record/save-junction',
    }
  }

  getFormModalProps() {
    if (getUrlParam('recordId') > 0) {
      return {
        ...super.getFormModalProps(),
        type: 'right'
      }
    } else return {...super.getFormModalProps()}
  }

  renderSidebarFilter(): null|JSX.Element {
    if (this.state?.description?.ui?.filters && ! this.state.sidebarFilterHidden) {
      return <div className="flex flex-col gap-2 text-nowrap">
        {Object.keys(this.state.description.ui.filters).map((filterName) => {
          const filter = this.state.description.ui.filters[filterName];
          const filterValue = this.state.filters[filterName] ?? (filter.default ?? null);

          return <div key={filterName}>
            {filter.title
              ? <div className='bg-primary/10 p-1 text-sm dark:text-white dark:bg-slate-800'>{filter.title}</div>
              : null
            }
            <div className={"list" + (filter.direction == "horizontal" ? " horizontal" : "")}>
              {Object.keys(filter.options).map((key: any) => {
                return <button
                  key={key}
                  className={
                    "max-w-60 btn btn-small btn-list-item "
                    + (filterValue == key ? "btn-primary" : "btn-transparent")
                    + (filter.direction == "horizontal" ? " text-center" : "")
                  }
                  style={{borderLeft: (filter.colors && filter.colors[key] ? '0.5em solid ' + filter.colors[key] : null)}}
                  onClick={() => {
                    let filters = this.state.filters ?? {};

                    if (filter.type == 'multipleSelectButtons') {
                      if (filterValue) {
                        if (filterValue.includes(key)) {
                          filters[filterName] = [];
                          for (let i in filterValue) {
                            if (filterValue[i] != key) filters[filterName].push(filterValue[i]);
                          }
                        } else {
                          filters[filterName] = filterValue;
                          filters[filterName].push(key);
                        }
                      } else {
                        filters[filterName] = [ key ];
                      }
                    } else {
                      console.log(filters, filterName, key);
                      if (filters[filterName] == key) {
                        delete filters[filterName];
                      } else {
                        filters[filterName] = key;
                      }
                      console.log(filters);
                    }

                    if (!this.props.parentForm) {
                      setUrlParam('filters', filters);
                    }

                    this.setState({recordId: 0, filters: filters}, () => this.reload());
                  }}
                >
                  {filter.type == 'multipleSelectButtons' ?
                    <span className="icon"><input type="checkbox" checked={filterValue && filterValue.includes(key)}></input></span>
                  : null}
                  <span className="text">{filter.options[key]}</span>
                </button>;
              })}
            </div>
          </div>;
        })}
      </div>;
    } else {
      return null;
    }
  }

  renderForm(): JSX.Element {
    let formProps: HubletoFormProps = this.getFormProps();
    return <HubletoForm {...formProps}/>;
  }

  renderTree(nodes: any, idParent: number = 0, level: number = 0): JSX.Element {
    if (nodes.length && nodes.length > 0) {
      return <div className='list'>
        {nodes.map((node, index) => {
          const hasChildren = node.children && node.children.length > 0;
          const isExpanded = !this.state.collapsedNodeIds.includes(node.id);
          return <div className='list-item'>
            <div className='flex gap-2 justify-between'>
              {hasChildren ?
                <div>
                  <button
                    className='btn btn-transparent btn-list-item w-full'
                    onClick={() => {
                      let collapsedNodeIds = this.state.collapsedNodeIds;
                      if (collapsedNodeIds.includes(node.id)) {
                        for (let i in collapsedNodeIds) {
                          if (collapsedNodeIds[i] == node.id) {
                            delete collapsedNodeIds[i];
                          }
                        }
                      } else {
                        collapsedNodeIds.push(node.id);
                      }
                      this.setState({collapsedNodeIds: collapsedNodeIds});
                    }}
                  >
                    <span className='icon'><i className={'fas fa-' + (isExpanded ? 'chevron-up' : 'chevron-down')}></i></span>
                  </button>
                </div>
              : null}
              <div className='grow'>
                <button
                  className='btn btn-transparent btn-list-item w-full'
                  onClick={() => {
                    this.openForm(node.id);
                  }}
                >
                  <span className='text'>{node.title}</span>
                </button>
              </div>
            </div>
            {hasChildren && isExpanded ?
              <div className='m-4'>
                {this.renderTree(node.children, node.id, level + 1)}
              </div>
            : null}
          </div>;
        })}
      </div>;
    } else {
      return <></>;
    }
  }

  renderDataView(): JSX.Element {
    switch (this.state.description?.ui?.dataView) {
      case 'tree':
        return this.renderTree(this.state?.data?.tree);
      break;
      default:
        return super.renderDataView();
      break;
    }
  }

  renderContent(): JSX.Element {
    return <>
      {super.renderContent()}
      {this.state.showExportCsvScreen ?
        <ModalForm
          ref={this.refExportCsvModal}
          form={this.refExportCsvForm}
          uid={this.props.uid + '_export_csv_modal'}
          isOpen={true}
          type='centered large'
        >
          <HubletoTableExportCsvForm
            ref={this.refExportCsvForm}
            modal={this.refExportCsvModal}
            model={this.props.model}
            parentTable={this}
            onClose={() => { this.setState({showExportCsvScreen: false}); }}
          ></HubletoTableExportCsvForm>
        </ModalForm>
      : null}
      {this.state.showImportCsvScreen ?
        <ModalForm
          ref={this.refImportCsvModal}
          form={this.refImportCsvForm}
          uid={this.props.uid + '_import_csv_modal'}
          isOpen={true}
          type='centered large'
        >
          <HubletoTableImportCsvForm
            ref={this.refImportCsvForm}
            modal={this.refImportCsvModal}
            model={this.props.model}
            parentTable={this}
            onClose={() => { this.setState({showImportCsvScreen: false}); }}
          ></HubletoTableImportCsvForm>
        </ModalForm>
      : null}
      {this.state.showColumnConfigScreen ?
        <ModalForm
          ref={this.refColumnConfigModal}
          form={this.refColumnsConfigScreen}
          uid={this.props.uid + '_columns_config_modal'}
          isOpen={true}
          type='right'
          title='Customize Columns'
        >
          <HubletoTableColumnsCustomize
            ref={this.refColumnsConfigScreen}
            parentTable={this}
            tableTag={this.props.tag}
            tableModel={this.model}
            onClose={() => this.setState({showColumnConfigScreen: false})}
          ></HubletoTableColumnsCustomize>
        </ModalForm>
      : null}
    </>;
  }
}