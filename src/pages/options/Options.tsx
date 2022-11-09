import * as React from "react";
import { useCallback } from "react";
import Tabs from "antd/es/tabs";
import Export from "./components/Export";
import "./Options.scss";

const { TabPane } = Tabs;

export function Options() {
  const onTabChange = useCallback(() => {
    console.log("tab changed...");
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
      </Tabs>
    </div>
  );
}
