import React, { Component } from 'react'
import { Input, InputProps, InputState } from '../Input'
import * as uuid from 'uuid';

interface JsonKeyValueInputState extends InputState {
  textareaValue: string,
  previewInvalidated: boolean
}

export default class JsonKeyValue extends Input<InputProps, JsonKeyValueInputState> {
  static defaultProps = {
    inputClassName: 'JsonKeyValue',
    uid: uuid.v4(),
    id: uuid.v4(),
  }

  state: JsonKeyValueInputState;

  constructor(props: InputProps) {
    super(props);

    this.state = {
      ...this.state, // Parent state
      isInitialized: true,
    };
  }

  getValueAsArray() {
    let valAsObj = null;
    try {
      valAsObj = JSON.parse(this.state.value ?? '{}');
    } catch (ex) {
      valAsObj = {};
    }

    if (!valAsObj) valAsObj = {};

    let valAsArray = [];
    Object.keys(valAsObj).map((key) => {
      valAsArray.push([key, valAsObj[key]]);
    })

    return valAsArray;
  }

  convertArrayToObject(valArray: any): object {
    let valObj = {};
    valArray.map((keyValue, index) => { valObj[keyValue[0]] = keyValue[1]; });
    return valObj;
  }

  addNewKeyValue() {
    let newValue = this.getValueAsArray();
    newValue.push(['', '']);
    this.onChange(JSON.stringify(this.convertArrayToObject(newValue)));
  }

  updateKeyValue(index: number, key: string, value: string) {
    let newValue = this.getValueAsArray();
    newValue[index] = [key, value];
    this.onChange(JSON.stringify(this.convertArrayToObject(newValue)));
  }

  renderInputElement() {
    const valArray = this.getValueAsArray();

    return <div>
      {valArray.map((item: any, index: number) => {
        const refKey: any = React.createRef();
        const refValue: any = React.createRef();
        return <div key={index} className="flex w-full gap-2">
          <input
            ref={refKey}
            value={valArray[index][0]}
            onChange={() => this.updateKeyValue(index, refKey.current.value, refValue.current.value)}
          />
          <input
            ref={refValue}
            value={valArray[index][1]}
            onChange={() => this.updateKeyValue(index, refKey.current.value, refValue.current.value)}
          />
        </div>;
      })}
      <div className="mt-2">
        <button
          className="btn btn-transparent btn-small"
          onClick={() => this.addNewKeyValue()}
        >
          <span className="icon"><i className="fas fa-plus"></i></span>
          <span className="text">{this.translate('Add value')}</span>
        </button>
      </div>
    </div>;
  }
}
