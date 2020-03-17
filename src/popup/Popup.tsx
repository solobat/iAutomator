import * as React from 'react';
import { createContext, useState, useEffect, useReducer, useContext } from 'react';
import './Popup.scss';
import browser from 'webextension-polyfill'
import Button from 'antd/es/button';
import * as recordsController from '../server/controller/records.controller'
import { getTabMeta } from '../helper/tab'
import Response from '../server/common/response';
import { Table } from 'antd'

// https://developer.chrome.com/extensions/activeTab
function getTabs(fn) {
  chrome.tabs.query({ currentWindow: true, active: true }, (results) => {
    if (results && results.length) {
      const info = getTabMeta(results[0])

      if (info) {
        fn(info)
      }
    }
  })
}

const ACTIONS = {
  TAB_META: 'tabMeta'
}

function pageReducer(state, action) {
  const { type, payload } = action;
  const newState: any = {};

  switch (type) {
    case ACTIONS.TAB_META:
      newState.tab = payload;
      break;
    default:
      break;
  }
  return {
    ...state,
    ...newState
  }
}

const PageContext = createContext(null)

export default function (props) {
  const [state, dispatch] = useReducer(pageReducer, {
    tab: null
  })

  useEffect(() => {
    getTabs((result) => {
      dispatch({ type: ACTIONS.TAB_META, payload: result })
    })
  }, [])

  return (
    <PageContext.Provider value={{ state, dispatch }}>
      <Popup />
    </PageContext.Provider>
  )
}

function Popup() {
  const { state } = useContext(PageContext)
  console.log("Popup -> state", state)

  return (
    <div className="popupContainer">
      {state.tab ? <TabInfo tab={state.tab} /> : null}
    </div>
  )
}

interface TabMeta extends chrome.tabs.Tab {
  host: string;
  hostname: string;
  pathname: string;
  hash: string;
  search: string;
}

interface TabInfoProps {
  tab: TabMeta;
}

function TabInfo(props: TabInfoProps) {
  const { host } = props.tab

  return (
    <div className="tab-info">
      <Records host={host} />
    </div>
  )
}

interface RecordsProps {
  host: string;
}

function onRecordRunClick(item, tabId) {
  chrome.tabs.executeScript(tabId, {
    code: `window.exceAutomation("${item.content}")`
  }, (result) => {
  })
}

function getPath(url) {
  const u = new URL(url)

  return u.pathname
}

const RecordsColumns = [
  { title: 'Action', dataIndex: 'content', key: 'content' },
  {
    title: 'Path', dataIndex: 'url', key: 'url',
    render: (text) => <span>{ getPath(text)}</span>,
    ellipsis: true
  },
  {
    title: 'Operation',
    dataIndex: '',
    key: 'id',
    render: (text, record) => <RunBtn record={record} />,
  }
]

function RunBtn(props) {
  const { state } = useContext(PageContext)
  const { id } = state.tab

  return (
    <a onClick={() => onRecordRunClick(props.record, id)}>Run</a>
  )
}

function Records(props: RecordsProps) {
  const { host } = props
  const [list, setList] = useState([])

  useEffect(() => {
    recordsController.query({ domain: host }).then((res: Response) => {
      if (res.code === 0) {
        setList(res.data)
      }
    })
  }, [host])
  return (
    <div>
      <Table columns={RecordsColumns} dataSource={list} pagination={false}
        size="small"></Table>
    </div>
  )
}