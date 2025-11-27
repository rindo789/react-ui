import React, { Component } from 'react'
import AsyncSelect from 'react-select/async'
import AsyncCreatable from 'react-select/async-creatable'
import LookupInput, { LookupInputProps, LookupInputState } from './Lookup'
import request from '../Request'
import * as uuid from 'uuid';
import { ProgressBar } from 'primereact/progressbar';

interface UserSelectInputProps extends LookupInputProps {
  model?: string
  endpoint?: string,
  customEndpointParams?: any,
  urlAdd?: string,
  uiStyle?: 'default' | 'select' | 'buttons';
}

interface UserSelectInputState extends LookupInputState {
  data: Array<any>,
  model: string
  endpoint: string,
  customEndpointParams: any,
}

export default class UserSelect extends LookupInput<UserSelectInputProps, UserSelectInputState> {
  static defaultProps = {
    inputClassName: 'user-select',
    uid: uuid.v4(),
    id: uuid.v4(),
    uiStyle: 'default',
  }

  props: UserSelectInputProps;
  state: UserSelectInputState;

  getEndpointUrl() {
    return 'api/get-users';
  }

  renderValueElement() {
    return this.renderInputElement();
  }

  renderInputElement() {
    if (!this.state.data) return <>...</>;
    return <div className='flex flex-wrap gap-2 items-center'>
      <div ref={this.refInput} className="btn-group gap-1 flex-wrap">
        {Object.keys(this.state.data).map((key: any) => {
          const user = this.state.data[key] ?? null;
          const userId = user.id ?? 0;
          console.log(user);
          return <>
            <button
              key={key}
              className={
                "btn " + (this.state.readonly && this.state.value != userId ? "btn-disabled" : "")
                + " " + (this.state.value == userId ? "btn-primary" : "btn-transparent")
              }
              onClick={() => {
                if (!this.state.readonly) this.onChange((this.state.value == userId ? null : userId));
              }}
            >
              <span className="text flex gap-2">
                {user.photo ?
                  <img
                    src={globalThis.main.config.uploadUrl + '/' + user.photo}
                    className='max-w-4 max-h-4 rounded-xl'
                  />
                : null}
                <span className='text-xs'>{user.first_name} {user.last_name}</span>
              </span>
              <span className="hover min-w-48">
                <div className='flex flex-col gap-2'>
                  <div className='grow'>
                    {user.photo ?
                      <img
                        src={globalThis.main.config.uploadUrl + '/' + user.photo}
                        className='max-w-12 max-h-12 rounded-xl'
                      />
                    : <div className='bg-gray-200 rounded-xl w-12 h-12 flex items-center justify-center'>
                      <i className='fas fa-user'></i>
                    </div>}
                  </div>
                  <div>
                    <div className='text-primary'>{user.email}</div>
                    <div className='font-bold'>{user.position}</div>
                    <div>{user.first_name ?? ''} {user.last_name ?? ''} </div>
                  </div>
                </div>
                {user.TEAMS.map((team: any, key: any) => {
                  return <div
                    key={key}
                    className='badge flex gap-2 items-center py-1'
                    style={{borderLeft: '0.5em solid ' + team.color}}
                  >
                    <i className='fas fa-users'></i>
                    {team.name}
                  </div>;
                })}
              </span>
            </button>
          </>;
        })}
      </div>
    </div>;
  }
}
