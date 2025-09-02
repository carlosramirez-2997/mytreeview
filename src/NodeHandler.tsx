import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-typeahead/css/Typeahead.css";
import ConfirmModal from "./ConfirmModal";

type TreeNode = {
  name: string;
  type: string;
  hier_id: Number | null;
  depth: Number | null;
  node_key: string | null;
  parent_id: Number | null;
  children?: TreeNode[];
};

interface TreeNodeProps {
  node: TreeNode;
  tree: TreeNode;
  moveNode: (tree: TreeNode, nodeKey: string, newParentKey: string) => TreeNode;
  setDataTree: (tree: TreeNode) => void;
  findNodeByCode: (root: TreeNode, code: string) => TreeNode | null;
}

const searchNodes = (
  node: TreeNode,
  parentLabel?: string
): { label: string; value: string }[] => {
  const currentLabel = parentLabel
    ? `${parentLabel} → ${node.name}`
    : node.name;
  let res: { label: string; value: string }[] = [
    { label: currentLabel, value: node.node_key ?? "" },
  ];

  if (node.children) {
    for (let child of node.children) {
      res = res.concat(searchNodes(child, node.name));
    }
  }
  return res;
};

const NodeHandler: React.FC<TreeNodeProps> = ({
  node,
  tree,
  moveNode,
  setDataTree,
  findNodeByCode,
}) => {
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState("");
  const [optionSelected, setOptionSelected] = useState("");
  const [results, setResults] = useState<{ label: string; value: string }[]>(
    []
  );

  const [newName, setNewName] = useState(node.name);
  const [newTreePath, setNewTreePath] = useState(node.node_key);
  const allNodes = React.useMemo(() => searchNodes(tree), [tree]);

  useEffect(() => {
    setNewName(node.name);
    setNewTreePath(node.node_key);
  }, [node]);

  const updateNodeName = (
    tree: TreeNode,
    nodeKey: string,
    newName: string
  ): TreeNode => {
    if (tree.node_key === nodeKey) {
      return { ...tree, name: newName };
    }

    if (tree.children) {
      return {
        ...tree,
        children: tree.children.map((child) =>
          updateNodeName(child, nodeKey, newName)
        ),
      };
    }

    return tree;
  };

  const handleSaveName = () => {
    const updatedTree = updateNodeName(tree, node.node_key ?? "", newName);
    setDataTree(updatedTree);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim() === "") {
      setResults([]);
    } else {
      const filtered = allNodes
        .filter((n) => n.label.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 10);
      setResults(filtered);
    }
  };

  const handleSelect = (option: { label: string; value: string }) => {
    setQuery(option.label);
    setResults([]);
    console.log("Selected node key:", option.value);
    setOptionSelected(option.value);
    setShow(true);
  };

  const handleMove = (nodeKey: string, newParentKey: string) => {
    const updated = moveNode(tree, nodeKey, newParentKey);
    setDataTree(updated);
    setShow(false);
    setQuery("");
    setOptionSelected("");
  };

  function removeNode(root: TreeNode, nodeId: string): TreeNode | null {
    if (!root.children) return null;

    const index = root.children.findIndex(
      (c: TreeNode) => c.node_key === nodeId
    );
    if (index !== -1) {
      return root.children.splice(index, 1)[0];
    }

    for (const child of root.children) {
      const removed = removeNode(child, nodeId);
      if (removed) return removed;
    }
    return null;
  }

  function reparentNode(root: TreeNode, nodeId: string, newCode: string) {
    const parts = newCode.split(".");

    const node = removeNode(root, nodeId);
    if (!node) return root;

    node.node_key = newCode;

    if (parts.length === 1) {
      if (root.children?.some((child) => child.node_key === newCode)) {
        console.warn("Node with this code already exists at root:", newCode);
        return root;
      }
      root.children = [...(root.children || []), node];
    } else {
      const parentCode = parts.slice(0, -1).join(".");
      const parent = findNodeByCode(root, parentCode);

      if (!parent) {
        console.warn("Parent not found for code:", parentCode);
        return root;
      }

      if (parent.children?.some((child) => child.node_key === newCode)) {
        console.warn(
          "Node with this code already exists under parent:",
          newCode
        );
        return root;
      }

      parent.children = [...(parent.children || []), node];
    }

    return root;
  }

  const handleUpdateTreePath = () => {
    const updatedTree = reparentNode(
      { ...tree },
      node.node_key || "",
      newTreePath || ""
    );
    setDataTree(updatedTree);
  };

  return (
    <div className="container mt-4">
      <div className="mb-3">
        <p>
          <strong>Business Line:</strong> {String(node.hier_id ?? "")}
        </p>
        <p>
          <strong>ID:</strong> {String(node.hier_id ?? "")}
        </p>
        <p>
          <strong>Tree Code:</strong> {node.node_key ?? ""}
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Edits</h5>

          {/* Change Name */}
          <div className="mb-3 row">
            <label className="col-sm-3 col-form-label">Change Name:</label>
            <div className="col-sm-7">
              <input
                type="text"
                name="name"
                className="form-control"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="col-sm-2">
              <button
                type="button"
                className="btn btn-success btn-sm w-100"
                onClick={handleSaveName}
              >
                ✔ Save
              </button>
            </div>
          </div>

          {/* Change Parent BL */}
          <div className="mb-3 row">
            <label className="col-sm-3 col-form-label">Change Parent BL:</label>
            <div className="col-sm-9">
              <input
                type="text"
                className="form-control"
                placeholder="Search node..."
                value={query}
                onChange={handleChange}
              />
              {results.length > 0 && (
                <ul
                  className="list-group position-absolute w-100"
                  style={{ zIndex: 1000 }}
                >
                  {results.map((r, idx) => (
                    <li
                      key={idx}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleSelect(r)}
                      style={{ cursor: "pointer" }}
                    >
                      {r.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Change Tree Code */}
          <div className="mb-3 row">
            <label className="col-sm-3 col-form-label">Change Tree Code:</label>
            <div className="col-sm-7">
              <input
                type="text"
                name="treeCode"
                className="form-control"
                value={newTreePath ?? ""}
                onChange={(e) => setNewTreePath(e.target.value)}
              />
            </div>
            <div className="col-sm-2">
              <button
                type="button"
                className="btn btn-success btn-sm w-100"
                onClick={handleUpdateTreePath}
              >
                ✔ Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={show}
        title="Move Confirmation"
        message={`Assign new BusinessLine: ${node.name} -> ${query}?`}
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={() => handleMove(node.node_key ?? "", optionSelected)}
        onCancel={() => setShow(false)}
      />
    </div>
  );
};

export default NodeHandler;
