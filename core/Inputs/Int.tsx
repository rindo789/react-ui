import React from 'react'
import { Input, InputProps, InputState } from '../Input'
import * as uuid from 'uuid';

interface IntInputProps extends InputProps {
  unit?: string
}

export default class Int extends Input<IntInputProps, InputState> {
  static defaultProps = {
    inputClassName: 'int',
    uid: uuid.v4(),
    id: uuid.v4(),
  }

  props: IntInputProps;

  constructor(props: InputProps) {
    super(props);

    this.state = {
      ...this.state, // Parent state
      isInitialized: true,
    };
  }

  renderInputElement() {
    const decimals = this.props.description?.decimals ?? 0;
    const step = this.props.description?.step ?? 1;
    return <div className='flex gap-2'>
      <input
        ref={this.refInput}
        type="number"
        step={step}
        value={this.state.value}
        // onKeyDown={(evt) => evt.key === 'e' && evt.preventDefault()}
        // onKeyDown={(e) => this.setState({value: e.currentTarget.value.replace('e', '')})}
        onChange={(e) => this.onChange(e.currentTarget.value.replace('e', ''))}
        placeholder={this.props.description?.placeholder ?? '0' + (decimals > 0 ? '.' + '0'.repeat(decimals) : '')}
        className={
          "form-control"
          + " " + (this.state.invalid ? 'is-invalid' : '')
          + " " + (this.props.cssClass ?? "")
          + " " + (this.state.readonly ? "bg-muted" : "")
          + " max-w-40"
        }
        disabled={this.state.readonly}
      />
      {this.props.unit ? <div>{this.props.unit}</div> : null}
    </div>;
  }
}
