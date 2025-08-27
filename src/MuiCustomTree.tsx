import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Divider,
  TextField,
  Button,
  Autocomplete,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import { styled } from "@mui/material/styles";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";
import mydata from "./myresponse.json";

const CustomTreeItem = styled(TreeItem)({
  [`& .${treeItemClasses.iconContainer}`]: {
    "& .close": {
      opacity: 0.3,
    },
  },
});

function CloseSquare(props: SvgIconProps) {
  return (
    <SvgIcon
      className="close"
      fontSize="inherit"
      style={{ width: 14, height: 14 }}
      {...props}
    >
      <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
    </SvgIcon>
  );
}

function renderTree(node: any) {
  return (
    <CustomTreeItem
      key={node.node_key}
      itemId={node.node_key}
      label={node.name}
    >
      {node.children && node.children.length > 0
        ? node.children.map((child: any) => renderTree(child))
        : null}
    </CustomTreeItem>
  );
}

function normalizeIds(ids: string | string[]): string[] {
  return Array.isArray(ids) ? ids : [ids];
}

function findNodeById(node: any, targetId: string): any | null {
  if (node.node_key === targetId) {
    return node;
  }
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, targetId);
      if (found) return found;
    }
  }
  return null;
}

// --------- helpers to move nodes ----------
function removeNode(node: any, nodeId: string): [any | null, any | null] {
  if (node.node_key === nodeId) {
    return [node, null];
  }

  if (node.children) {
    const newChildren: any[] = [];
    let removed: any = null;
    for (const child of node.children) {
      const [r, updated] = removeNode(child, nodeId);
      if (r) removed = r;
      if (updated) newChildren.push(updated);
    }
    return [removed, { ...node, children: newChildren }];
  }

  return [null, node];
}

function insertNode(node: any, parentId: string, newNode: any): any {
  if (String(node.node_key) === parentId) {
    return {
      ...node,
      children: [...(node.children || []), newNode],
    };
  }
  if (node.children) {
    return {
      ...node,
      children: node.children.map((child: any) =>
        insertNode(child, parentId, newNode)
      ),
    };
  }
  return node;
}

function moveNode(tree: any, nodeId: string, newParentId: string): any {
  const [removedNode, treeWithoutNode] = removeNode(tree, nodeId);
  if (!removedNode) return tree;
  return insertNode(treeWithoutNode, newParentId, removedNode);
}
// ------------------------------------------

export default function MuiCustomTree() {
  const [treeData, setTreeData] = useState<any>(mydata.tree);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [editName, setEditName] = useState("");
  const [newParentId, setNewParentId] = useState({} as any);

  const allNodes = useMemo(() => {
    const result: { id: string; label: string }[] = [];

    const dfs = (node: any, parentId: string = "") => {
      // hierarchical ID
      const name = parentId ? `${parentId} -> ${node.name}` : String(node.name);

      result.push({ id: node.node_key, label: name });

      node.children?.forEach((child: any) => dfs(child, name));
    };

    dfs(treeData);
    return result;
  }, [treeData]);

  function getNodePath(
    node: any,
    targetId: string,
    path: string[] = []
  ): string[] | null {
    if (node.node_key === targetId) return [...path, node.node_key];
    if (node.children) {
      for (const child of node.children) {
        const result = getNodePath(child, targetId, [...path, node.node_key]);
        if (result) return result;
      }
    }
    return null;
  }

  function handleSave() {
    if (!selectedNode) return;
    const updated = { ...selectedNode, name: editName };
    setSelectedNode(updated);
    // ideally also update in treeData
  }

  function handleMove() {
    if (!selectedNode || !newParentId) return;
    setTreeData((prev: any) =>
      moveNode(prev, selectedNode.node_key, newParentId)
    );
    setNewParentId("");
  }

  return (
    <Box sx={{ display: "flex", minHeight: 352, minWidth: 600 }}>
      {/* Left tree section */}
      <Box sx={{ flex: 1, borderRight: "1px solid #ddd", p: 2 }}>
        <SimpleTreeView
          defaultExpandedItems={["grid"]}
          slots={{
            expandIcon: AddBoxIcon,
            collapseIcon: IndeterminateCheckBoxIcon,
            endIcon: CloseSquare,
          }}
          onSelectedItemsChange={(_: any, ids: any) => {
            const selectedIds = normalizeIds(ids);
            if (selectedIds.length > 0) {
              const targetId = selectedIds[0];
              const node = findNodeById(treeData, targetId);
              setSelectedNode(node ? { ...node } : null);
              setEditName(node ? node.name : "");

              const path = getNodePath(treeData, targetId);
              if (path) {
                setExpanded(path);
              }
            } else {
              setSelectedNode(null);
            }
          }}
          expandedItems={expanded}
        >
          {renderTree(treeData)}
        </SimpleTreeView>
      </Box>

      {/* Right detail panel */}
      <Box sx={{ flex: 2, p: 2 }}>
        {selectedNode ? (
          <>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Node Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>
              <strong>Name:</strong> {selectedNode.name}
            </Typography>
            <Typography>
              <strong>Line ID:</strong> {selectedNode.hier_id}
            </Typography>
            <Typography>
              <strong>Tree:</strong> {selectedNode.node_key}
            </Typography>
            <Typography>
              <strong>Code:</strong> {selectedNode.type}
            </Typography>

            <Box sx={{ flex: 2, p: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Edits
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Edit name */}
              <TextField
                fullWidth
                label="Name"
                value={editName}
                onChange={(e: any) => setEditName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={handleSave} sx={{ mb: 2 }}>
                Save Changes
              </Button>

              {/* Move node */}
              <Autocomplete
                value={newParentId.name}
                onChange={(_: any, newParentId: any) => {
                  if (!newParentId) {
                    setNewParentId({});
                    return;
                  }

                  setNewParentId(newParentId);
                  if (newParentId) {
                    const selected = allNodes.find(
                      (n: any) => n.label === newParentId
                    );
                    if (selected) {
                      setNewParentId(selected);
                    }
                  }
                }}
                options={allNodes.map((n: any) => n.label)}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    label="Search node..."
                    variant="outlined"
                  />
                )}
                sx={{ width: 300, marginBottom: 2 }}
              />
              <Button variant="outlined" onClick={handleMove}>
                Move Node
              </Button>
            </Box>
          </>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Select a node to see details
          </Typography>
        )}
      </Box>
    </Box>
  );
}
