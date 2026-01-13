import HtmlFrame from "@hubleto/react-ui/core/HtmlFrame";
import React, { Component } from 'react'
import { Input, InputProps, InputState } from '../Input'
import * as uuid from 'uuid';
import DOMPurify from 'dompurify';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism.css'; //Example style, you can use another

interface TextareaWithHtmlPreviewInputState extends InputState {
  textareaValue: string,
  previewInvalidated: boolean
  isFullscreen: boolean;
}

export default class TextareaWithHtmlPreview extends Input<InputProps, TextareaWithHtmlPreviewInputState> {
  static defaultProps = {
    inputClassName: 'TextareaWithHtmlPreview',
    uid: uuid.v4(),
    id: uuid.v4(),
  }

  state: TextareaWithHtmlPreviewInputState;

  refPreview: any;

  constructor(props: InputProps) {
    super(props);

    this.refPreview = React.createRef();

    this.state = {
      ...this.state, // Parent state
      isInitialized: true,
      textareaValue: this.state.value,
      previewInvalidated: false,
      isFullscreen: false,
    };
  }

  renderInputElement() {
    let editorStyle: any = {
      overflow: 'auto',
      fontFamily: 'monospace',
      fontSize: 11,
    };
    let wrapperStyle: any = {};

    if (this.state.isFullscreen) {
      wrapperStyle.position = 'fixed';
      wrapperStyle.left = '0px';
      wrapperStyle.top = '0px';
      wrapperStyle.width = '100vw';
      wrapperStyle.height = '100vh';
      wrapperStyle.background = 'white';
      wrapperStyle.padding = '1em';
      wrapperStyle.zIndex = 9999999;
    }
    return <div
      className='flex gap-2 w-full'
      style={wrapperStyle}
    >
      <div className='w-1/2 card'>
        <div className='card-header'>
          HTML content
          <div>
            <button
              className='btn btn-small btn-transparent'
              onClick={() => { this.setState({isFullscreen: !this.state.isFullscreen}); }}
            >
              <span className='icon'><i className='fas fa-expand'></i></span>
              <span className='text'>{this.translate('Toggle fullscreen')}</span>
            </button>
          </div>
        </div>
        <div className='card-body flex flex-col overflow-y-auto'>
          {/* <textarea
            className='w-full min-h-[15em]'
            style={{fontFamily: 'courier', whiteSpace: 'nowrap', padding: '0.5em'}}
            value={this.state.textareaValue}
            onChange={(e) => {
              this.setState({textareaValue: e.target.value});
            }}
          /> */}
          <Editor
            className="bg-slate-100 w-full overflow-y"
            value={this.state.textareaValue ?? ''}
            onValueChange={(newValue) => {
              this.setState({textareaValue: newValue});
              this.onChange(newValue);
            }}
            highlight={code => highlight(code, languages.markup)}
            padding={10}
            style={editorStyle}
          />
        </div>
      </div>
      <div className={'w-1/2 card ' + (this.state.previewInvalidated ? 'card-danger' : '')}>
        <div className='card-header'>
          Preview
        </div>
        <div className='card-body'>
          <HtmlFrame
            ref={this.refPreview}
            className='w-full h-full'
            content={this.state.textareaValue}
          />
        </div>
      </div>
    </div>;
  }
}
