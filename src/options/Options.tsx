import * as React from 'react';
import { useCallback } from 'react';
import Tabs from 'antd/es/tabs';
import Export from './components/Export';
import WebDav from './components/WebDav';
import './Options.scss';

const { TabPane } = Tabs;

export function Options() {
  const onTabChange = useCallback(() => {

  }, []);

  return (
    <div className="container">
      <Tabs defaultActiveKey="1" onChange={onTabChange}>
        <TabPane tab="Basic" key="1">
          iHelpers
        </TabPane>
        <TabPane tab="Export" key="2">
          <Export />
        </TabPane>
        <TabPane tab="WebDav" key="3">
          <WebDav />
        </TabPane>
      </Tabs>
    </div>
  )
}