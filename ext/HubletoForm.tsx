import React, { Component } from "react";
import Form, { FormDescription, FormProps, FormState } from "@hubleto/react-ui/core/Form";
import request from '@hubleto/react-ui/core/Request';
import HubletoApp from '@hubleto/react-ui/ext/HubletoApp'

//@ts-ignore
import WorkflowSelector from '@hubleto/apps/Workflow/Components/WorkflowSelector';
import { content } from "html2canvas/dist/types/css/property-descriptors/content";
import moment from "moment";

export interface HubletoFormProps extends FormProps {
  icon?: string,
  junctionTitle?: string,
  junctionModel?: string,
  junctionSourceColumn?: string,
  junctionDestinationColumn?: string,
  junctionSourceRecordId?: number,
  junctionSaveEndpoint?: string,
  renderWorkflowUi?: boolean,
  timeline?: Array<any>,
}
export interface HubletoFormState extends FormState {
  icon?: string,
}

export default class HubletoForm<P, S> extends Form<HubletoFormProps,HubletoFormState> {
  static defaultProps: any = {
    ...Form.defaultProps
  };

  props: HubletoFormProps;
  state: HubletoFormState;

  parentApp: string|HubletoApp;

  constructor(props: HubletoFormProps) {
    super(props);

    this.state = this.getStateFromProps(props);
  }

  getParentApp(): HubletoApp
  {
    if (typeof this.parentApp == 'string') return globalThis.main.getApp(this.parentApp);
    else return this.parentApp;
  }

  getStateFromProps(props: FormProps) {
    return {
      ...super.getStateFromProps(props),
      isInlineEditing: true,
      icon: this.props.icon,
    }
  }

  onAfterSaveRecord(saveResponse, customSaveOptions?: any) {
    super.onAfterSaveRecord(saveResponse, customSaveOptions);
    if (
      this.props.junctionSaveEndpoint
      && this.props.junctionModel
      && this.props.junctionSourceColumn
      && this.props.junctionDestinationColumn
      && this.props.junctionSourceRecordId
    ) {
      request.post(
        this.props.junctionSaveEndpoint,
        {
          junctionModel: this.props.junctionModel,
          junctionSourceColumn: this.props.junctionSourceColumn,
          junctionDestinationColumn: this.props.junctionDestinationColumn,
          junctionSourceRecordId: this.props.junctionSourceRecordId,
          junctionDestinationRecordId: saveResponse.savedRecord['id'],
        },
        {},
        (data: any) => { /* */ }
      );
    }
  }

  getCustomTabs()
  {
    const customTabs = this.getParentApp()?.getCustomFormTabs() ?? [];
    return customTabs;
  }

  getHeaderButtons()
  {
    return this.getParentApp()?.getFormHeaderButtons() ?? [];
  }

  renderHeaderLeft(): null|JSX.Element {
    const headerButtons = this.getHeaderButtons();
    return <>
      <div className='flex gap-2 items-center'>
        {this.state.icon ?
          <div><i className={this.state.icon + ' text-3xl text-primary/20 m-2'}></i></div>
        : null}
        <div className='flex flex-col gap-2'>
          <div className='flex'>{super.renderHeaderLeft()}</div>
          {headerButtons && headerButtons.length > 0 ? <div className='flex gap-2'>{headerButtons.map((button, key) => {
            return <button
              className='btn btn-small btn-primary-outline'
              onClick={() => { button.onClick(this); }}
            >
              <span className='text'>{button.title}</span>
            </button>;
          })}</div> : null}
        </div>
      </div>
    </>;
  }

  renderCustomInputs(): JSX.Element|Array<JSX.Element> {
    let customInputs: any = [];

    if (this.state?.description?.inputs) {
      Object.keys(this.state.description.inputs).map((inputName) => {
        const inputDesc = this.state.description.inputs[inputName];
        if (inputDesc.isCustom) {
          customInputs.push(this.inputWrapper(inputName));
        }
      });
    }

    return customInputs;
  }

  renderFooter(): null|JSX.Element {
    return <>
      <div className='w-full flex justify-between'>
        <div className="flex gap-2 items-center dark:text-white">
          <div>#{this.state.record.id}</div>
          <div>{this.renderPrevRecordButton()}</div>
          <div>{this.renderNextRecordButton()}</div>
        </div>
        <div>
          {this.getRecordFormUrl() ? <>
            <a
              className='btn btn-transparent btn-small'
              title='Open in new tab'
              href={globalThis.main.config.projectUrl + '/' + this.getRecordFormUrl()}
              target='_blank'
            >
              <span className='icon'><i className='fas fa-link'></i></span>
              <span className='text'>{globalThis.main.config.projectUrl + '/' + this.getRecordFormUrl()}</span>
            </a>
            <button
              className='btn btn-transparent btn-small'
              title='Copy link to clipboard'
              onClick={() => {
                navigator.clipboard.writeText(globalThis.main.config.projectUrl + '/' + this.getRecordFormUrl());
              }}
            >
              <span className='icon'><i className='fas fa-copy'></i></span>
            </button>
          </> : null}
        </div>
        {this.props.junctionModel ?
          <div className='badge flex gap-2'>
            <div><i className='fas fa-link'></i></div>
            {/* <div>{this.props.junctionModel.substring(this.props.junctionModel.lastIndexOf('/') + 1)}</div> */}
            <div>{this.props.junctionTitle}</div>
            <div>#{this.props.junctionSourceRecordId}<br/></div>
          </div>
        : null}
        <div>
          {this.renderDeleteButton()}
        </div>
      </div>
    </>;
  }

  renderTopMenu(): null|JSX.Element {
    const topMenu = super.renderTopMenu();
    const dynamicMenu = globalThis.main.injectDynamicContent(
      this.constructor.name + ':TopMenu',
      {form: this}
    );

    let topMenuWithDynamicMenu = null;
    if (topMenu != null || dynamicMenu != null) {
      topMenuWithDynamicMenu = <>{topMenu} {dynamicMenu}</>;
    }

    if (this.props.renderWorkflowUi) {
      return <div className='flex flex-col'>
        {topMenuWithDynamicMenu}
        {this.state.id <= 0 ? null : <div className='flex p-2 bg-gradient-to-b from-gray-50 to-white'>
          <div className='flex-2'><WorkflowSelector parentForm={this}></WorkflowSelector></div>
          {this.state.description && this.state.description.inputs && this.state.description.inputs.is_closed
            ? <div className='text-right'>{this.inputWrapper('is_closed', {wrapperCssClass: 'flex gap-2'})}</div>
            : null
        }
        </div>}
      </div>
    } else {
      return topMenuWithDynamicMenu;
    }
  }

  renderContent(): null|JSX.Element {
    const R = this.state.record;
    let content = super.renderContent();
    let timeline = null;
    let timelinePointsUnsorted = {};

    if (this.props.timeline) {
      this.props.timeline.map((aboutEntry, key) => {
        const entries = aboutEntry.data(this) ?? [];
        
        entries.map((entry, key) => {
          timelinePointsUnsorted[aboutEntry.timestampFormatter(entry)] = {
            icon: aboutEntry.icon,
            color: aboutEntry.color,
            value: aboutEntry.valueFormatter ? aboutEntry.valueFormatter(entry) : null,
            userName: aboutEntry.userNameFormatter ? aboutEntry.userNameFormatter(entry) : null,
          };
        });
      });
    }

    let timelinePoints = Object.keys(timelinePointsUnsorted)
      .sort() // Sort the keys alphabetically
      .reverse()
      .reduce((obj, key) => {
        obj[key] = timelinePointsUnsorted[key]; // Rebuild the object with sorted keys
        return obj;
      }, {});

    if (JSON.stringify(timelinePoints) != '{}') {
      let now = moment();
      timeline = Object.keys(timelinePoints).map((key) => {
        const days = moment(now).diff(moment(key), 'days');
        const entry = timelinePoints[key];

        now = moment(key);

        return <>
          {days <= 0 ? null : <div className='badge text-xs'>{days} day(s)</div>}
          <div
            className='
              flex flex-col items-center p-2 border-l border-l-4 overflow-hidden hover:shadow-sm
              justify-center bg-white
            '
            style={{borderColor: entry.color}}
          >
            {/* <div className='text-xs'><i className={entry.icon}></i></div> */}
            <div className='text-xs font-bold text-nowrap'>{key}</div>
            <div className='p-2 text-center text-xs'>{entry.value}</div>
            {/* {entry.userName ? <div className='badge text-xs'>@{entry.userName}</div> : null} */}
          </div>
        </>;
      });
    }

    if (timeline) {
      return <div className='flex gap-2'>
        <div className='grow'>{content}</div>
        <div className='shrink p-2 flex flex-col items-center gap-2 max-w-48'>{timeline}</div>
      </div>
    } else {
      return content;
    }

  }


}
