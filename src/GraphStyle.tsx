import mydata from "./myresponse.json";
import React, { useState, useEffect } from "react";
import Tree from "react-d3-tree";

interface TreeNode {
  name: string;
  children?: TreeNode[];
  [key: string]: any; // extra metadata
}

export default function GraphTree() {
  const [data, setData] = useState<TreeNode | null>(null);

  useEffect(() => {
    setData(mydata.tree as TreeNode);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Tree
        data={data}
        orientation="vertical" // horizontal also works
        translate={{ x: 400, y: 50 }} // adjust start pos
        pathFunc="elbow" // nice curved edges
      />
    </div>
  );
}
