import React, { Component } from 'react';
import { HubletoComponentProps } from './Component';

export interface HtmlFrameProps {
  iframeId?: string,
  content?: string,
  className?: string,
}

export interface HtmlFrameState {
}

export default class HtmlFrame extends Component<HtmlFrameProps, HtmlFrameState> {

  render() {
    return <>
      <iframe
        src="about:blank"
        className={this.props.className}
        srcDoc={this.props.content}
        id={this.props.iframeId}
      />
    </>
  }
}
