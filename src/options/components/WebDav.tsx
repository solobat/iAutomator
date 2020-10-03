import * as React from 'react';
import { useState, useCallback } from 'react';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import { getWebDavURL, initClientWithConfig, isWebDavConfiged, removeWebDavConfig, saveConfig } from '../../helper/webdav';
import { noticeBg } from '../../helper/event';
import { APP_ACTIONS } from '../../common/const';

const { useForm } = Form;

export default function() {
  const [isConfiged, setConfiged] = useState(isWebDavConfiged());
  const onConfigSaved = useCallback(() => {
    setConfiged(true);
    noticeBg({
      action: APP_ACTIONS.START_SYNC
    });
  }, []);
  const onReset = useCallback(() => {
    setConfiged(false);
    noticeBg({
      action: APP_ACTIONS.STOP_SYNC
    });
  }, []);

  return (
    <div>
      {
        isConfiged ? 
        <ResetConfig onReset={onReset}/> :
        <FormConfig onSave={onConfigSaved}/>
      }
    </div>
  )
}

function ResetConfig(props) {
  const url = getWebDavURL()
  const onReset = useCallback(() => {
    removeWebDavConfig();
    props.onReset();
  }, []);

  return (
    <div>
      URL: {url}
      <div>
        <Button onClick={onReset} type="primary">Reset</Button>
      </div>
    </div>
  )
}

const tailLayout = {
  wrapperCol: { offset: 12, span: 12 },
};

function FormConfig(props) {
  const [form] = useForm();
  const onFinish = values => {
    initClientWithConfig(values).then(() => {
      saveConfig(values);
      props.onSave();
    })
  }

  return (
    <Form form={form} name="config-webdav" onFinish={onFinish}
      className="webdav-form" labelCol={{span: 5}}>
      <Form.Item name="url" label="URL" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="username" label="User Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="password" label="Password" rules={[{ required: true }]}>
        <Input.Password />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  )
}
