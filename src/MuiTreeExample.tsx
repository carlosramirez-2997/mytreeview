//import mydata from "./temp.json";
import mydata from "./myresponse.json";
import React from "react";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";

interface TreeNode {
  name: string;
  node_key: number | string;
  children?: TreeNode[];
  [key: string]: any; // other metadata
}

interface MuiTreeNode {
  id: string;
  label: string;
  children?: MuiTreeNode[];
}

const mapToMuiTree = (node: TreeNode): MuiTreeNode => ({
  id: String(node.node_key), // unique id for MUI
  label: node.name, // display name
  children: node.children?.map(mapToMuiTree), // recurse
});

const MuiTreeExample: React.FC = () => {
  return <RichTreeView items={[mapToMuiTree(mydata.tree)]} />;
};

export default MuiTreeExample;
