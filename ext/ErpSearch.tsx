import React, { Component } from "react";
import request from "@hubleto/react-ui/core/Request";
import AsyncSelect from 'react-select/async'
import { components } from "react-select";

export interface ErpSearchProps {
  endpoint: string,
  endpointParams?: any,
}

export interface ErpSearchState {
  // query?: any,
  results?: any
}

const Option = (innerProps, isDisabled) => {
  return (
    <components.Option {...innerProps}>
      <div>{innerProps.data.label}</div>
      <div className="text-xs">{innerProps.data.description}</div>
      {innerProps.data.APP_SHORT_NAME ? 
        <div className="badge badge-extra-small text-xs">
          <i className={"pr-2 fas fa-" + innerProps.data.APP_ICON}></i>
          {innerProps.data.APP_SHORT_NAME}
        </div>
      : null}
    </components.Option>
  )
}

export default class ErpSearch<P, S> extends Component<ErpSearchProps, ErpSearchState> {
  props: ErpSearchProps;
  state: ErpSearchState;

  searchRef: any;

  constructor(props: ErpSearchProps) {
    super(props);

    this.searchRef = React.createRef();
    globalThis.hubleto.reactElements['global-fulltext-search'] = this;

    this.state = {
      // query: '',
      results: null,
    }
  }

  loadOptions(inputValue: string|null = null, callback: ((option: Array<any>) => void)|null = null) {
    request.post(
      this.props.endpoint,
      {...this.props.endpointParams, query: inputValue},
      {},
      (results: any) => {
        this.setState({
          results: results
        });

        if (callback) callback(Object.values(results ?? {}));
      }
    );
  }

  onChange(item: any) {
    // let query = this.state.query;
    if (item) {
      if (item.url) {
        location.href = globalThis.hubleto.config.projectUrl + '/' + item.url;
      }
      // if (item.autocomplete) {
      //   console.log('setva', {id: 0, label: item.autocomplete});
      //   this.searchRef.current.setValue({id: 0, label: item.autocomplete});
      //   this.searchRef.current
      // }
    }
    // this.setState({query: query});
  }

  render(): JSX.Element {
    // console.log('q', this.state.query);
    return <>
      <AsyncSelect
        // value={{
        //   id: 0,
        //   label: this.state.query
        // }}
        ref={this.searchRef}
        isClearable={true}
        // inputValue={this.state.query}
        // defaultInputValue="Type Ctrl+K to start searching..."
        loadOptions={(inputValue: string, callback: any) => this.loadOptions(inputValue, callback)}
        getOptionLabel={(option: any) => { return option.label }}
        getOptionValue={(option: any) => { return option.id }}
        // onKeyDown={(e: any) => { console.log(this.searchRef.current.getValue()); }}
        onChange={(item: any) => { this.onChange(item); }}
        components={{ Option }}
        placeholder='[Ctrl+K] Search in Hubleto...'
        className="hubleto-lookup"
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
        menuPosition="fixed"
        menuPortalTarget={document.body}
      />
    </>;
  }
}
