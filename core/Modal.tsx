import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import * as uuid from 'uuid';

export interface ModalProps {
  onClose?: (modal: Modal) => void;
  uid: string,
  type?: string,
  children?: any;
  title?: any;
  showHeader?: boolean;
  headerLeft?: any;
  isOpen?: boolean;
  topMenu?: any;
  isFullscreen?: boolean,
}

export interface ModalState {
  stackUid?: string,
  isActive: boolean,
  uid: string,
  type: string,
  isOpen: boolean;
  title?: string;
  isFullscreen: boolean,
}

export default class Modal extends Component<ModalProps> {
  state: ModalState;

  constructor(props: ModalProps) {
    super(props);

    if (this.props.uid) {
      globalThis.hubleto.reactElements[this.props.uid] = this;
    }

    this.state = this.getStateFromProps(props);
  }

  getStateFromProps(props: ModalProps) {
    return {
      uid: props.uid ?? uuid.v4(),
      type: props.type ?? "right",
      isOpen: props.isOpen ?? false,
      title: props.title,
      isFullscreen: props.isFullscreen,
      stackUid: uuid.v4(),
      isActive: false,
    };
  };

  componentDidMount() {
    globalThis.hubleto.addModalToStack(this);
  }

  componentWillUnmount() {
    globalThis.hubleto.removeModalFromStack(this);
  }

  /**
   * This function trigger if something change, for Form id of record
   */
  componentDidUpdate(prevProps: any) {
    if (
      prevProps.title != this.props.title
      || prevProps.isOpen != this.props.isOpen
    ) {
      this.setState(this.getStateFromProps(this.props));
    }
  }

  close() {
    if (this.props.onClose) this.props.onClose(this);
  }

  render(): JSX.Element {
    return <></>;
  } 
}
