import * as React from "react";
import { useState, useCallback } from "react";
import Form from "antd/es/form";
import Input from "antd/es/input";
import Button from "antd/es/button";
import { noticeBg } from "../../../helper/event";
import {
  APP_ACTIONS,
  STORAGE_KEYS,
  SYNC_INTERVAL_OPTIONS,
  WEBDAV_MAX_SYNC_INTERVAL,
} from "@src/common/const";
import { useLocalStorageState } from "ahooks";
import Select from "antd/es/select";
import Switch from "antd/es/switch";
import { useExtlibsContext } from "@src/context/ExtlibsContext";

const { Option } = Select;
const { useForm } = Form;

export default function WebDav() {
  const { libs } = useExtlibsContext();
  const [isConfiged, setConfiged] = useState(libs.Webdav.isWebDavConfiged());
  const onConfigSaved = useCallback(() => {
    setConfiged(true);
    noticeBg({
      action: APP_ACTIONS.START_SYNC,
    });
  }, []);
  const onReset = useCallback(() => {
    setConfiged(false);
    noticeBg({
      action: APP_ACTIONS.STOP_SYNC,
    });
  }, []);

  return (
    <div>
      {isConfiged ? (
        <ResetConfig onReset={onReset} />
      ) : (
        <FormConfig onSave={onConfigSaved} />
      )}
    </div>
  );
}

function ResetConfig(props: { onReset: () => void }) {
  const { libs } = useExtlibsContext();
  const [url, setURL] = useState("");
  const [syncInterval, setSyncInterval] = useLocalStorageState(
    STORAGE_KEYS.SYNC_INTERVAL,
    {
      defaultValue: WEBDAV_MAX_SYNC_INTERVAL,
    }
  );
  const [autoSync, setAutoSync] = useLocalStorageState(STORAGE_KEYS.AUTO_SYNC, {
    defaultValue: 1,
  });

  const onReset = useCallback(() => {
    libs.Webdav.removeWebDavConfig();
    setSyncInterval(WEBDAV_MAX_SYNC_INTERVAL);
    props.onReset();
  }, []);
  const onIntervalChange = useCallback((value) => {
    setSyncInterval(Number(value));
    noticeBg({
      action: APP_ACTIONS.START_SYNC,
    });
  }, []);
  const onAutoSyncChange = useCallback((value) => {
    setAutoSync(Number(value));
  }, []);

  React.useEffect(() => {
    libs.Webdav.getWebDavURL().then((res) => {
      setURL(res);
    });
  }, []);

  return (
    <Form className="webdav-form" labelCol={{ span: 5 }}>
      <Form.Item label="URL">{url}</Form.Item>
      <Form.Item label="Sync Interval">
        <Select defaultValue={syncInterval} onChange={onIntervalChange}>
          {SYNC_INTERVAL_OPTIONS.map((opt, index) => {
            return (
              <Option value={opt.value} key={index}>
                {opt.label}
              </Option>
            );
          })}
        </Select>
      </Form.Item>
      <Form.Item label="Auto Sync">
        <Switch
          defaultChecked={autoSync === 1}
          onChange={onAutoSyncChange}
        ></Switch>
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Button onClick={onReset} type="primary">
          Reset
        </Button>
      </Form.Item>
    </Form>
  );
}

const tailLayout = {
  wrapperCol: { offset: 5, span: 12 },
};

function FormConfig(props: { onSave: () => void }) {
  const [form] = useForm();
  const { libs } = useExtlibsContext();
  const onFinish = (values) => {
    libs.Webdav.initClientWithConfig(values).then(() => {
      libs.Webdav.saveConfig(values);
      props.onSave();
    });
  };

  return (
    <Form
      form={form}
      name="config-webdav"
      onFinish={onFinish}
      className="webdav-form"
      labelCol={{ span: 5 }}
    >
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
  );
}
