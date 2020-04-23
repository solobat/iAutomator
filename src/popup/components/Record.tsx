import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import { PageContext, ACTIONS } from '../../store/modules/popup.store';
import * as recordsController from '../../server/controller/records.controller'
import Response from '../../server/common/response';
import Table, { ColumnsType } from 'antd/es/table'
import { PlayCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { AutomationForm } from '../../common/types';
import { getPath } from '../../helper/url';

interface RecordsProps {
  host: string;
}

function onRecordRunClick(item, tabId) {
  chrome.tabs.executeScript(tabId, {
    code: `window.exceAutomation("${item.content}")`
  }, (result) => {
  })
}

const RecordsColumns: ColumnsType = [
  { title: 'Action', dataIndex: 'content', ellipsis: true },
  {
    title: 'Path', dataIndex: 'url',
    render: (text) => <span>{ getPath(text)}</span>,
    ellipsis: true
  },
  {
    title: 'Operation',
    width: '100px',
    render: (text, record) => <RecordOpBtns record={record} />,
  }
]

function RecordOpBtns(props) {
  return (
    <div className="record-op-btns">
      <RunBtn record={props.record} />
      <AddAmBtn record={props.record}/>
    </div>
  )
}

function RunBtn(props) {
  const { state } = useContext(PageContext)
  const { id } = state.tab

  return (
    <span onClick={() => onRecordRunClick(props.record, id)}>
      <PlayCircleOutlined translate=""/>
    </span>
  )
}

function onRecordAddAmClick(record, dispatch) {
  const payload: AutomationForm = {
    instructions: record.content,
    pattern: record.url
  }
  dispatch({ type: ACTIONS.TAB_CHANGE, payload: 'automation' })
  dispatch({ type: ACTIONS.AUTOMATION_FORM_UPDATE, payload })
}

function AddAmBtn(props) {
  const { dispatch } = useContext(PageContext)

  return (
    <span onClick={() => onRecordAddAmClick(props.record, dispatch)}>
      <PlusCircleOutlined translate=""/>
    </span>
  ) 
}

export function Records(props: RecordsProps) {
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