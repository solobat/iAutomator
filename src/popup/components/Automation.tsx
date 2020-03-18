import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import { PageContext, ACTIONS } from '../../store/modules/popup.store';
import * as automationsController from '../../server/controller/automations.controller'
import Response from '../../server/common/response';
import Table from 'antd/es/table'
import Button from 'antd/es/button';
import Input from 'antd/es/input'
import { PlusSquareOutlined } from '@ant-design/icons';
import { matchAutomations } from '../../helper/automations';
import { noticeBg } from '../../helper/event';

export function AutomationsPanel() {
  const { state, dispatch } = useContext(PageContext)
  const { amFormEditing } = state
  return (
    <div>
      {
        amFormEditing ? <AutomationEditor /> : <PlusSquareOutlined style={{fontSize: '20px'}}
          onClick={() => dispatch({ type: ACTIONS.AUTOMATION_FORM_UPDATE, payload: { instructions: '', pattern: ''}})} />
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
      automationsController.saveAutomation(form.instructions, form.pattern).then((resp) => {
        if (resp.code === 0) {
          setSaving(false)
          dispatch({ type: ACTIONS.AUTOMATION_FORM_CLOSE, payload: null})
          noticeBg({
            action: 'refreshAutomations'
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
  { title: 'Instructions', dataIndex: 'instructions', key: 'instructions' },
  { title: 'Pattern', dataIndex: 'pattern', key: 'pattern' },
]

function Automations(props) {
  const { host } = props
  const [list, setList] = useState([])
  const { state } = useContext(PageContext)

  useEffect(() => {
    automationsController.getList().then((res: Response) => {
      if (res.code === 0) {
        setList(matchAutomations(res.data, state.tab.url))
      }
    })
  }, [host, state.amFormEditing])

  return (
    <div>
      <Table columns={AutomationsColumns} dataSource={list} pagination={false}
        size="small"></Table>
    </div>
  )
}