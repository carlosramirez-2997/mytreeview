import React, { useState } from "react";
import "./App.css";
import data from "./myresponse.json";
import TreeView, { TreeNode } from "./TreeView";
import NodeHandler from "./NodeHandler";

function App() {
  const [selected, setSelected] = useState<string | undefined>();
  const [ancestors, setAncestors] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [dataTree, setDataTree] = useState<TreeNode>(data);

  const findNodeByKey = (node: TreeNode, key: string): TreeNode | null => {
    if (node.node_key === key) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNodeByKey(child, key);
        if (found) return found;
      }
    }
    return null;
  };

  const handleSelect = (nodeKey: string, ancestorPath: string[]) => {
    setSelected(nodeKey);
    setAncestors(ancestorPath);
    const node = findNodeByKey(dataTree, nodeKey);
    setSelectedNode(node);
  };

  const recalcKeys = (node: TreeNode, parentKey: string | null) => {
    if (!parentKey) {
      node.node_key = "1";
    } else {
      node.node_key = parentKey;
    }

    if (node.children) {
      node.children.forEach((child, index) => {
        const newKey = `${node.node_key}.${index + 1}`;
        recalcKeys(child, newKey);
      });
    }
  };

  function findNodeByCode(root: TreeNode, code: string): TreeNode | null {
    if (root.node_key === code) return root;
    if (!root.children) return null;

    for (const child of root.children) {
      const found = findNodeByCode(child, code);
      if (found) return found;
    }
    return null;
  }

  const moveNode = (
    tree: TreeNode,
    nodeKey: string,
    newParentKey: string
  ): TreeNode => {
    let nodeToMove: TreeNode | null = null;

    const removeNode = (current: TreeNode): TreeNode => {
      if (!current.children) return current;

      current.children = current.children.filter((child) => {
        if (child.node_key === nodeKey) {
          nodeToMove = { ...child };
          return false;
        }
        return true;
      });

      current.children = current.children.map(removeNode);
      return current;
    };

    let updatedTree = removeNode({ ...tree });

    if (!nodeToMove) return updatedTree;

    const addNode = (current: TreeNode): TreeNode => {
      if (current.node_key === newParentKey) {
        nodeToMove!.parent_id = Number(newParentKey);
        current.children = [...(current.children || []), nodeToMove!];
      } else if (current.children) {
        current.children = current.children.map(addNode);
      }
      return current;
    };

    let addedNode = addNode(updatedTree);
    recalcKeys(tree, null);

    return addedNode;
  };

  return (
    <div className="app-panels">
      <div className="left-panel">
        <div className="tree-root">
          <TreeView
            node={dataTree}
            selected={selected}
            ancestors={ancestors}
            onSelect={handleSelect}
            ancestorPath={[]}
          />
        </div>
      </div>
      <div className="right-panel">
        {selectedNode ? (
          <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>{selectedNode.name}</h4>
              <div>
                <button className="btn btn-primary btn-sm me-2">+ Add</button>
                <button className="btn btn-secondary btn-sm">✎ Edit</button>
              </div>
            </div>

            <div className="mb-3">
              <NodeHandler
                node={selectedNode}
                tree={dataTree}
                moveNode={moveNode}
                setDataTree={setDataTree}
                findNodeByCode={findNodeByCode}
              />
            </div>
          </div>
        ) : (
          <p>Select a node to see details</p>
        )}
      </div>
    </div>
  );
}

export default App;
