import * as React from 'react';
import { useState, useEffect, useContext, useCallback } from 'react';
import { PageContext, ACTIONS, useModel } from '../../store/modules/popup.store';
import * as automationsController from '../../server/controller/automations.controller'
import Response from '../../server/common/response';
import Table from 'antd/es/table'
import Button from 'antd/es/button';
import Input from 'antd/es/input'
import { PlusSquareOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { matchAutomations } from '../../helper/automations';
import { noticeBg } from '../../helper/event';
import { PAGE_ACTIONS } from '../../common/const';

export function AutomationsPanel() {
  const { state, dispatch } = useContext(PageContext)
  const { amFormEditing } = state
  return (
    <div>
      {
        amFormEditing ? <AutomationEditor /> : <span 
          onClick={() => dispatch({ type: ACTIONS.AUTOMATION_FORM_UPDATE, payload: { instructions: '', pattern: ''}})}>
          <PlusSquareOutlined style={{fontSize: '20px'}} translate="no" />
        </span>
      }
      <Automations />
    </div>
  )
}

function validateAmForm(form) {
  const { instructions, pattern } = form
  if (instructions && pattern) {
    return true
  } else {
    return false
  }
}

function onAmFormChange(attrs, dispatch) {
  dispatch({ type: ACTIONS.AUTOMATION_FORM_UPDATE, payload: attrs})
}

function AutomationEditor() {
  const { state, dispatch } = useContext(PageContext)
  const { automationForm: form } = state
  const [saving, setSaving] = useState(false)

  function onAmEditorSaveClick() {
    if (validateAmForm(form)) {
      setSaving(true)
      automationsController.saveAutomation(form.instructions, form.pattern, form.runAt, form.id).then((resp) => {
        if (resp.code === 0) {
          setSaving(false)
          dispatch({ type: ACTIONS.AUTOMATION_FORM_CLOSE, payload: null})
          noticeBg({
            action: PAGE_ACTIONS.REFRESH_AUTOMATIONS
          })
        }
      })
    } else {

    }
  }

  function onAmEditorCancleClick() {
    dispatch({ type: ACTIONS.AUTOMATION_FORM_CLOSE, payload: null})
  }

  return (
    <div className="am-editor">
      <div className="am-editor-fields">
        <Input placeholder="Instructions" value={form.instructions}
          onChange={(event) => {onAmFormChange({
            instructions: event.target.value
          }, dispatch)}} />
        <Input placeholder="Pattern" value={form.pattern} 
          onChange={(event) => {onAmFormChange({
            pattern: event.target.value
          }, dispatch)}}/>
      </div>
      <div className="am-editor-btns">
        <Button onClick={() => onAmEditorCancleClick()} style={{marginRight: '10px'}}>Cancel</Button>
        <Button disabled={saving} onClick={() => onAmEditorSaveClick()}>Save</Button>
      </div>
    </div>
  ) 
}

const AutomationsColumns = [
  { title: 'Instructions', dataIndex: 'instructions' },
  { title: 'Pattern', dataIndex: 'pattern' },
  {
    title: 'Operation',
    width: '120px',
    render: (text, record) => <OpBtns record={record} />,
  }
]

function OpBtns(props) {

  return (
    <div className="op-btns">
      <EditBtn record={props.record}/>
      <DeleteBtn record={props.record} />
    </div>
  )
}

function EditBtn(props) {
  const { state, dispatch } = useModel()
  const onClick = useCallback(() => {
    dispatch({ type: ACTIONS.AUTOMATION_FORM_UPDATE, payload: props.record })
  }, [])

  return (
    <span onClick={onClick}><EditOutlined translate="no"/></span>
  )
}

function DeleteBtn(props) {
  const { state, dispatch } = useModel()
  const onClick = useCallback(() => {
    automationsController.deleteItem(props.record.id).then(() => {
      fetchList(state, dispatch)
      noticeBg({
        action: PAGE_ACTIONS.REFRESH_AUTOMATIONS
      })
    })
  }, [])

  return (
    <span onClick={onClick}><DeleteOutlined translate="no"/></span>
  )
}

function fetchList(state, dispatch) {
  automationsController.getList().then((res: Response) => {
    if (res.code === 0) {
      dispatch({ type: ACTIONS.AUTOMATIONS, payload: matchAutomations(res.data, state.tab.url) })
    }
  })
}

function Automations(props) {
  const { host } = props
  const { state, dispatch } = useContext(PageContext)

  useEffect(() => {
    fetchList(state, dispatch)
  }, [host, state.amFormEditing])

  return (
    <div>
      <Table columns={AutomationsColumns} dataSource={state.automations}
        pagination={false} size="small">
      </Table>
    </div>
  )
}