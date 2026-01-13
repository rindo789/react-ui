import React, { Component } from 'react'
import { Input, InputProps, InputState } from '../Input'
import * as uuid from 'uuid';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface WysiwygInputProps extends InputState {
  showHtmlCode?: boolean,
}

interface WysiwygInputState extends InputState {
  textareaValue: string,
}

export default class Wysiwyg extends Input<WysiwygInputProps, WysiwygInputState> {
  static defaultProps = {
    inputClassName: 'Wysiwyg',
    uid: uuid.v4(),
    id: uuid.v4(),
  }

  props: WysiwygInputProps;
  state: WysiwygInputState;

  refQuill: any;

  constructor(props: InputProps) {
    super(props);

    this.refQuill = React.createRef();

    this.state = {
      ...this.state, // Parent state
      isInitialized: true,
      textareaValue: this.state.value,
    };
  }

  renderInputElement() {
    return <div className='flex gap-2 w-full'>
      <div className='flex-1'>
        <ReactQuill
          ref={this.refQuill}
          theme="snow" // Use the 'snow' theme
          value={this.state.value}
          readOnly={this.state.readonly}
          onChange={(htmlValue: string) => {
            this.onChange(htmlValue);
            this.setState({textareaValue: htmlValue});
          }} // Content change handler
          modules={{
            toolbar: [
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              ['bold', 'italic', 'underline', 'strike', 'blockquote'],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
              ['link', 'image', 'clean']
            ],
          }}
          formats={[
            'header',
            'bold', 'italic', 'underline', 'strike', 'blockquote',
            'list', 'indent',
            'link', 'image'
          ]}
        />
      </div>
      {this.state.readonly || !this.props.showHtmlCode ? null : 
        <div className='flex-1'>
          <textarea
            className='w-full min-h-[15em]'
            style={{fontFamily: 'courier', whiteSpace: 'nowrap', padding: '0.5em'}}
            value={this.state.textareaValue}
            onChange={(e) => {
              this.setState({textareaValue: e.target.value});
            }}
          />
          <button
            className='btn btn-transparent mt-2'
            onClick={() => {
              console.log('this.state.textareaValue', this.state.textareaValue);
              // this.onChange(this.state.textareaValue);
              console.log(this.refQuill);
              this.refQuill.current.editor.clipboard.dangerouslyPasteHTML(this.state.textareaValue);

            }}
          >
            <span className='icon'><i className='fas fa-arrow-left'></i></span>
            <span className='text'>{this.translate('Use this HTML code')}</span>
          </button>
        </div>
      }
    </div>;
  }
}
