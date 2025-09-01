import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-typeahead/css/Typeahead.css";

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
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ label: string; value: string }[]>(
    []
  );

  const allNodes = React.useMemo(() => searchNodes(tree), [tree]);

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
    handleMove(node.node_key ?? "", option.value);
    console.log("Selected node key:", option.value);
  };

  const handleMove = (nodeKey: string, newParentKey: string) => {
    const updated = moveNode(tree, nodeKey, newParentKey);
    setDataTree(updated);
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>{node.name}</h4>
        <div>
          <button className="btn btn-primary btn-sm me-2">+ Add</button>
          <button className="btn btn-secondary btn-sm">✎ Edit</button>
        </div>
      </div>

      {/* Static Info */}
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

      {/* Editable Form */}
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
                value={node.name}
              />
            </div>
            <div className="col-sm-2">
              <button type="button" className="btn btn-success btn-sm w-100">
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
                value={node.node_key ?? ""}
              />
            </div>
            <div className="col-sm-2">
              <button type="button" className="btn btn-success btn-sm w-100">
                ✔ Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeHandler;
