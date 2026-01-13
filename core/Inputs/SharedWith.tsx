import React, { Component } from 'react'
import LookupInput, { LookupInputProps, LookupInputState } from './Lookup'
import ModalSimple from "../ModalSimple";
import * as uuid from 'uuid';

interface SharedWithInputProps extends LookupInputProps {
  model?: string
  endpoint?: string,
  customEndpointParams?: any,
  urlAdd?: string,
  uiStyle?: 'default' | 'select' | 'buttons';
}

interface SharedWithInputState extends LookupInputState {
  data: Array<any>,
  model: string
  endpoint: string,
  customEndpointParams: any,
  showModal?: boolean,
}

export default class SharedWith extends LookupInput<SharedWithInputProps, SharedWithInputState> {
  static defaultProps = {
    inputClassName: 'shared-with',
    uid: uuid.v4(),
    id: uuid.v4(),
    uiStyle: 'default',
  }

  props: SharedWithInputProps;
  state: SharedWithInputState;

  getEndpointUrl() {
    return 'api/get-users';
  }

  renderValueElement() {
    return this.renderInputElement();
  }

  renderInputElement() {
    if (!this.state.data) return <>...</>;

    let valuesPerUser = this.state.value;

    try {
      valuesPerUser = JSON.parse(this.state.value);
    } catch (ex) {
      valuesPerUser = {};
    }

    Object.keys(valuesPerUser).map((idUser: any) => {
      if (valuesPerUser[idUser] != 'read' && valuesPerUser[idUser] != 'modify') {
        delete valuesPerUser[idUser];
      }
    })

    return <>
      <button
        className="btn btn-transparent"
        onClick={() => { this.setState({showModal: true}); }}
      >
        <span className="icon"><i className="fas fa-share-nodes"></i></span>
        {Object.keys(valuesPerUser).length == 0 ? null :
          <span className="text flex gap-4 text-xs">
            {Object.keys(valuesPerUser).map((idUser: any) => {
              let user = null;
              this.state.data.map((tmpUser) => {
                if (tmpUser.id == idUser) user = tmpUser;
              });

              return (user ? <div>
                {user.nick ??
                  (Array.from(user.first_name ?? '')[0]).toString()
                  + (Array.from(user.last_name ?? '')[0]).toString()
                }
                {valuesPerUser[idUser] == 'read' ? <i className='text-xs fas fa-eye pl-2'></i> : null}
                {valuesPerUser[idUser] == 'modify' ? <i className='text-xs fas fa-pencil pl-2'></i> : null}
              </div> : null);
            })}
          </span>
        }
      </button>
      {this.state.showModal ?
        <ModalSimple
          uid='projects_table_discussions_modal'
          isOpen={true}
          type='right'
          showHeader={true}
          title={<>
            <h2>{this.translate('Share')}</h2>
          </>}
          onClose={(modal: ModalSimple) => { this.setState({showModal: false}); }}
        >
          <table ref={this.refInput} className="table-default"><tbody>
            {Object.keys(this.state.data).map((key: any) => {
              const user = this.state.data[key] ?? null;
              const userId = user.id ?? 0;
              return <tr>
                <td>{user.first_name} {user.last_name}</td>
                <td>
                  {user.photo ?
                    <img
                      src={globalThis.hubleto.config.uploadUrl + '/' + user.photo}
                      className='max-w-4 max-h-4 rounded-xl'
                    />
                  : null}
                </td>
                <td>{user.nick}</td>
                <td>
                  <select
                    value={valuesPerUser[userId]}
                    onChange={(event) => {
                      valuesPerUser[user.id] = event.currentTarget.value;
                    }}
                  >
                    <option value=''>Default access based on ownership</option>
                    <option value='read'>Can only read</option>
                    <option value='modify'>Can read and modify</option>
                  </select>
                </td>
              </tr>;
            })}
          </tbody></table>
          <button
            className='btn btn-add btn-large mt-4 m-auto'
            onClick={() => {
              this.onChange(JSON.stringify(valuesPerUser));
              this.setState({showModal: false});
            }}
          >
            <span className='icon'><i className='fas fa-check'></i></span>
            <span className='text'>{this.translate('Apply')}</span>
          </button>
        </ModalSimple>
      : null}
    </>;
  }
}
