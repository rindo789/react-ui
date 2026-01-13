import $ from 'jquery';
import { createRoot } from "react-dom/client";
import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import * as uuid from 'uuid';
import {isValidJson, kebabToPascal, camelToKebab, deepObjectMerge} from './Helper';
import Dialog from "./Dialog";
import Modal from "./Modal";

export class HubletoReactUi {
  config: object = {};

  reactComponents: any = {};
  reactElementsWaitingForRender: number = 0;
  reactElements: Object = {};
  renderedModals: Array<Modal> = [];

  primeReactTailwindTheme: any = {
    dataTable: {
      // root: { className: 'bg-primary' },
      headerRow: { className: 'bg-primary' },
    },
  };

  dictionary: any = null;
  lastShownDialogRef: any;
  defaultTranslationContext: string = 'app';

  dynamicContentInjectors: any = {};

  /**
  * Define attributes which will not removed
  */
  attributesToSkip = [
    'onclick'
  ];

  constructor(config: object) {
    this.config = config;
    globalThis.main = this;
  }

  setTranslationContext(context: string) {
    this.defaultTranslationContext = context;
  }

  translate(orig: string, context?: string, contextInner?: string): string {
    return orig; // to be overridden
  }

  addModalToStack(modal: Modal) {
    this.renderedModals.push(modal);
    // console.log('addModalToStack', this.renderedModals);
    this.activateLastModalInStack();
  }

  removeModalFromStack(modalToDelete: Modal) {
    let keyToDelete = null;
    this.renderedModals.map((modal, key) => {
      if (modal.state.stackUid === modalToDelete.state.stackUid) {
        keyToDelete = key;
      }
    })
    if (keyToDelete !== null) {
      delete this.renderedModals[keyToDelete];
      // console.log('removeModalFromStack', this.renderedModals);
      this.activateLastModalInStack();
    }
  }

  getActiveModalInStack() {
    let activeModal = null;

    this.renderedModals.map((modal, key) => {
      if (modal.state.isActive) activeModal = modal;
    });

    return activeModal;
  }

  activateLastModalInStack() {
    let lastModal = null;
    this.renderedModals.map((modal, key) => {
      if (modal) lastModal = modal;
    });

    // console.log('lastModal', lastModal);
    if (lastModal) {
      // console.log('lastModal.state.stackUid', lastModal.state.stackUid);
      this.renderedModals.map((modal, key) => {
        if (modal.state.stackUid != lastModal.state.stackUid) {
          // console.log('isActive: false', modal.state.stackUid);
          this.renderedModals[key].setState({isActive: false});
        }
      })
      // console.log('isActive: true', lastModal.state.stackUid);
      lastModal.setState({isActive: true});
    }
  }

  getValidationErrorMessage(messageString: string): JSX.Element {
    return <>
      <b>{this.translate('Some inputs need your attention')}</b><br/>
      <br/>
      {messageString}
    </>;
  }

  getDuplicateEntryErrorMessage(message: string): JSX.Element {
    return <>
      <b>{this.translate('Duplicate entry error')}</b><br/>
      <br/>
      <div>{message}</div>
    </>;
  }

  getGenericErrorMessage(message: string, code: number, details?: string): JSX.Element {
    return <>
      <pre className='text-red-800 text-base'>{message}</pre>
      <div className='text-xs mt-4 text-gray-400'>
        {code == 0 ? null : <div>Error #{code}</div>}
        <div>{details}</div>
      </div>
    </>;
  }

  showDialog(content: JSX.Element, props?: any) {
    const root = createRoot(document.getElementById('app-dialogs'));
    this.lastShownDialogRef = React.createRef();

    props.headerClassName = 'dialog-header ' + (props.headerClassName ?? '');
    props.contentClassName = 'dialog-content ' + (props.contentClassName ?? '');

    root.render(<>
      <Dialog
        ref={this.lastShownDialogRef}
        uid={'app_dialog_' + uuid.v4().replace('-', '_')}
        visible
        style={{minWidth: '50vw'}}
        {...props}
      >{content}</Dialog>
    </>);
  }

  showDialogDanger(content: JSX.Element, props?: any) {
    let defaultProps: any = {
      headerClassName: 'dialog-danger-header',
      contentClassName: 'dialog-danger-content',
      header: "🥴 Ooops",
      footer: <div className={"flex w-full justify-start"}>
        <button
          className="btn btn-transparent"
          onClick={() => { this.lastShownDialogRef.current.hide(); }}
        >
          <span className="icon"><i className="fas fa-check"></i></span>
          <span className="text">OK, I understand</span>
        </button>
      </div>
    };

    if (!props) props = {};

    if (!props.headerClassName) props.headerClassName = defaultProps.headerClassName;
    if (!props.contentClassName) props.contentClassName = defaultProps.contentClassName;
    if (!props.header) props.header = defaultProps.header;
    if (!props.footer) props.footer = defaultProps.footer;

    this.showDialog(content, props);
  }

  showDialogWarning(content: JSX.Element, props?: any) {
    let defaultProps: any = {
      headerClassName: 'dialog-warning-header',
      contentClassName: 'dialog-warning-content',
      header: "Warning",
      footer: <div className={"flex w-full justify-start"}>
        <button
          className="btn btn-transparent"
          onClick={() => { this.lastShownDialogRef.current.hide() }}
        >
          <span className="icon"><i className="fas fa-check"></i></span>
          <span className="text">OK, I understand</span>
        </button>
      </div>
    };

    if (!props) props = {};

    if (!props.headerClassName) props.headerClassName = defaultProps.headerClassName;
    if (!props.contentClassName) props.contentClassName = defaultProps.contentClassName;
    if (!props.header) props.header = defaultProps.header;
    if (!props.footer) props.footer = defaultProps.footer;

    this.showDialog(content, props);
  }

  showDialogConfirm(content: JSX.Element, props?: any) {
    const propsCloned = {...props};
    let defaultProps = {
      headerClassName: 'dialog-confirm-header',
      contentClassName: 'dialog-confirm-content',
      header: "Confirm",
      footer: <>
        <div className={"flex w-full justify-between"}>
          <button className={"btn " + propsCloned.yesButtonClass} onClick={() => { this.lastShownDialogRef.current.hide(); propsCloned.onYes(); }} >
            <span className="icon"><i className="fas fa-check"></i></span>
            <span className="text">{propsCloned.yesText}</span>
          </button>
          <button className={"btn " + propsCloned.noButtonClass} onClick={() => { this.lastShownDialogRef.current.hide(); propsCloned.onNo(); }} >
            <span className="icon"><i className="fas fa-xmark"></i></span>
            <span className="text">{propsCloned.noText}</span>
          </button>
        </div>
      </>
    };

    delete props.yesButtonClass;
    delete props.yesText;
    delete props.onYes;
    delete props.noButtonClass;
    delete props.noText;
    delete props.onNo;

    if (!props.headerClassName) props.headerClassName = defaultProps.headerClassName;
    if (!props.contentClassName) props.contentClassName = defaultProps.contentClassName;
    if (!props.header) props.footer = defaultProps.header;
    if (!props.footer) props.footer = defaultProps.footer;

    this.showDialog(content, props);
  }

  registerReactComponent(elementName: string, elementObject: any) {
    this.reactComponents[elementName] = elementObject;
  }

  /**
   * Get specific hubleto component with destructed params
   */
  renderReactElement(componentName: string, props: Object, children: any) {
    if (!componentName) return null;

    let componentNamePascalCase = kebabToPascal(componentName);

    if (!this.reactComponents[componentNamePascalCase]) {
      console.error('Hubleto: renderReactElement(' + componentNamePascalCase + '). Component does not exist. Use `hubleto.registerReactComponent()` in your project\'s index.tsx file.');
      return null;
    } else {
      return React.createElement(
        this.reactComponents[componentNamePascalCase],
        props,
        children
      );
    }
  };

  getReactElement(elementId: string): any {
    return this.reactElements[elementId] ?? null;
  }

  /**
  * Validate attribute value
  * E.g. if string contains Callback create frunction from string
  */
  // getValidatedAttributeValue(attributeName: string, attributeValue: any): Function|any {
  //   return attributeName.toLowerCase().includes('callback') ? new Function(attributeValue) : attributeValue;
  // }

  convertDomToReact(domElement) {
    let isHubletoComponent = false;
    let component: string = '';
    let componentProps: Object = {};

    if (domElement.nodeType == 3) { /* Text node: https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType */
      return <>{domElement.textContent}</>;
    } else {
      if (domElement.tagName.substring(0, 4) != 'APP-') {
        component = domElement.tagName.toLowerCase();
      } else {
        component = domElement.tagName.substring(4).toLowerCase();
        isHubletoComponent = true;
      }

      let attributesDoNotConvert: Array<string> = [];
      for (let i in domElement.attributes) {
        if (domElement.attributes[i].name == 'hubleto-do-not-convert') {
          attributesDoNotConvert = domElement.attributes[i].value.split(',');
        }
      }

      let i: number = 0
      while (domElement.attributes.length > i) {
        let attributeName: string = domElement.attributes[i].name.replace(/-([a-z])/g, (_: any, letter: string) => letter.toUpperCase());
        let attributeValue: any = domElement.attributes[i].value;

        if (!attributesDoNotConvert.includes(attributeName)) {
          if (attributeName.startsWith('json:')) {
            attributeName = attributeName.replace('json:', '');
            attributeValue = JSON.parse(attributeValue);
          } else if (attributeName.startsWith('string:')) {
            attributeName = attributeName.replace('string:', '');
            attributeValue = attributeValue;
          } else if (attributeName.startsWith('int:')) {
            attributeName = attributeName.replace('int:', '');
            attributeValue = parseInt(attributeValue);
          } else if (attributeName.startsWith('bool:')) {
            attributeName = attributeName.replace('bool:', '');
            attributeValue = attributeValue == 'true';
          } else if (attributeName.startsWith('function:')) {
            attributeName = attributeName.replace('function:', '');
            attributeValue = new Function(attributeValue);
          } else if (attributeValue === 'true') {
            attributeValue = true;
          } else if (attributeValue === 'false') {
            attributeValue = false;
          } else if (isValidJson(attributeValue)) {
            attributeValue = JSON.parse(attributeValue);
          }
        }

        componentProps[attributeName] = attributeValue;

        i++;
        // if (this.attributesToSkip.includes(attributeName)) {
        //   i++;
        //   continue;
        // }

        // // Remove attributes from HTML DOM
        // domElement.removeAttribute(domElement.attributes[i].name);
      }

      let children: Array<any> = [];

      domElement.childNodes.forEach((subElement, _index) => {
        children.push(this.convertDomToReact(subElement));
      });

      let reactElement: any = null;

      if (isHubletoComponent) {
        if (componentProps['uid'] == undefined) {
          componentProps['uid'] = '_' + uuid.v4().replace('-', '_');
        }

        reactElement = this.renderReactElement(
          component,
          componentProps,
          children
        );

        domElement.setAttribute('hubleto-react-rendered', 'true');
      } else {
        reactElement = React.createElement(
          component,
          componentProps,
          children
        );
      }

      return reactElement;
    }

  }

  /**
  * Render React component (create HTML tag root and render)
  */
  renderReactElements(rootElement?) {
    if (!rootElement) rootElement = document;

    rootElement.querySelectorAll('*').forEach((element, _index) => {

      if (element.tagName.substring(0, 4) != 'APP-') return;
      if (element.attributes['hubleto-react-rendered']) return;

      //@ts-ignore
      $(rootElement).addClass('react-elements-rendering');

      let elementRoot = createRoot(element);
      this.reactElementsWaitingForRender++;
      const reactElement = this.convertDomToReact(element)
      elementRoot.render(reactElement);

      // if (reactElement.props['uid']) {
      //   this.reactElements[reactElement.props['uid']] = reactElement;
      // }


      // https://stackoverflow.com/questions/75388021/migrate-reactdom-render-with-async-callback-to-createroot
      // https://blog.saeloun.com/2021/07/15/react-18-adds-new-root-api/
      requestIdleCallback(() => {
        this.reactElementsWaitingForRender--;

        // console.log($(element), $(element).html());
        // $(element).find('*').each((el) => {
        //   console.log($(el));//, $(this).html());
        //   // $(this).parent().before($(this));
        // });

        if (this.reactElementsWaitingForRender <= 0) {
          //@ts-ignore
          $(rootElement)
            .removeClass('react-elements-rendering')
            .addClass('react-elements-rendered')
          ;
        }
      });
    });

  }

  registerDynamicContent(contentGroup: string, injector: any) {
    if (!this.dynamicContentInjectors[contentGroup]) {
      this.dynamicContentInjectors[contentGroup] = [];
    }

    this.dynamicContentInjectors[contentGroup].push(injector);
  }

  injectDynamicContent(contentGroup: string, injectorProps: any): Array<JSX.Element>|null {
    if (this.dynamicContentInjectors && this.dynamicContentInjectors[contentGroup]) {
      let dynamicContent: Array<JSX.Element> = [];
      for (let i in this.dynamicContentInjectors[contentGroup]) {
        dynamicContent.push(
          React.createElement(
            this.dynamicContentInjectors[contentGroup][i],
            injectorProps
          )
        );
      }
      return dynamicContent;
      // return dynamicContent.map((content, key) => <div key={key}>{content}</div>);
    } else {
      return null;
    }
  }

}
