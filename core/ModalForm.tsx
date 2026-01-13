import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import * as uuid from 'uuid';
import Modal, { ModalProps, ModalState } from "./Modal";
import Form, { FormProps, FormState } from "./Form"

export interface ModalFormProps extends ModalProps {
  form: any,
}

export interface ModalFormState extends ModalState { }

export default class ModalForm extends Modal {
  static defaultProps = {
    type: 'centered',
  }

  props: ModalFormProps;
  state: ModalFormState;

  render(): JSX.Element {
    if (this.state.isOpen) {
      return <>
        <div
          key={this.props.uid}
          id={"hubleto-modal-" + this.props.uid}
          className={"modal " + (this.state.isFullscreen ? "fullscreen" : "") + " " + this.props.type}
        >
          <div className="modal-inner">
            {this.props.children}
          </div>
        </div>
      </>;
    } else {
      return <></>;
    }
  } 
}
