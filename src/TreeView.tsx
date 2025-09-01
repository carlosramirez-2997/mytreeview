import React, { useState } from "react";

export type TreeNode = {
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
  selected?: string;
  ancestors?: string[];
  onSelect?: (nodeKey: string, ancestors: string[]) => void;
  ancestorPath?: string[];
}

const TreeView: React.FC<TreeNodeProps> = ({
  node,
  selected,
  ancestors = [],
  onSelect,
  ancestorPath = [],
}) => {
  const [expanded, setExpanded] = useState(false);

  const isSelected = selected === node.node_key;
  const isAncestor = ancestors.includes(node.node_key ?? "");
  const hasChildren = node.children && node.children.length > 0;

  let className = "tree-node";
  if (isSelected) className += " selected";
  else if (isAncestor) className += " ancestor";
  else if (!hasChildren) className += " leaf";
  else className += " parent";

  return (
    <div className="tree-connector">
      <div
        className={`tree-item ${className}`}
        onClick={() => {
          if (onSelect) {
            onSelect(node.node_key!, ancestorPath);
          }
          if (!expanded) {
            setExpanded(true);
          }
        }}
      >
        {hasChildren && (
          <button
            className="collapse-btn"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((exp) => !exp);
            }}
          >
            {expanded ? "-" : "+"}
          </button>
        )}
        <span>{node.name}</span>
      </div>
      {hasChildren && (
        <div
          className={`tree-children-wrapper ${
            expanded ? "expanded" : "collapsed"
          }`}
        >
          <div className="tree-children">
            {node.children!.map((child, idx) => (
              <TreeView
                key={child.node_key ?? idx}
                node={child}
                selected={selected}
                ancestors={ancestors}
                onSelect={onSelect}
                ancestorPath={[...ancestorPath, node.node_key ?? ""]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeView;
