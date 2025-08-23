import { useState } from "react";
import { type ContributionNode, ContentType } from "../lib/contracts";

interface ContributionTreeProps {
  nodes: ContributionNode[];
  onSelectNode?: (node: ContributionNode) => void;
  selectedNodeId?: string;
  storyContentType: ContentType;
}

interface TreeNodeProps {
  node: ContributionNode;
  onSelectNode?: (node: ContributionNode) => void;
  selectedNodeId?: string;
  isLast: boolean;
  prefix: string;
  storyContentType: ContentType;
}

function TreeNode({
  node,
  onSelectNode,
  selectedNodeId,
  isLast,
  prefix,
  storyContentType,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedNodeId === node.contribution.id.toString();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: bigint) => {
    const timestampMs = Number(timestamp) * 1000;
    return new Date(timestampMs).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getContentTypeIcon = () => {
    switch (storyContentType) {
      case ContentType.TEXT:
        return "📝";
      case ContentType.IMAGE:
        return "🖼️";
      case ContentType.VIDEO:
        return "🎥";
      default:
        return "📄";
    }
  };

  const getBranchIcon = () => {
    return node.contribution.isBranch ? "🌿" : "📄";
  };

  return (
    <div className="font-mono text-sm">
      {/* Current node */}
      <div
        className={`flex items-center cursor-pointer p-2 rounded transition-colors duration-200 ${
          isSelected ? "bg-blue-100 border border-blue-300" : "hover:bg-gray-50"
        }`}
        onClick={() => onSelectNode?.(node)}
      >
        {/* Tree lines */}
        <span className="text-gray-400 mr-2 whitespace-pre">{prefix}</span>

        {/* Expand/collapse button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="mr-1 w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? "−" : "+"}
          </button>
        )}

        {/* Node content */}
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <span className="text-lg">{getBranchIcon()}</span>
          <span className="text-lg">{getContentTypeIcon()}</span>

          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">
              #{node.contribution.id.toString()}
              {node.contribution.isBranch && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Branch
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 flex items-center space-x-2">
              <span>{formatAddress(node.contribution.contributor)}</span>
              <span>•</span>
              <span>{formatDate(node.contribution.createdAt)}</span>
              {Number(node.contribution.upvotes) > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center">
                    👍 {Number(node.contribution.upvotes)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-4">
          {node.children.map((child, index) => {
            const isChildLast = index === node.children.length - 1;
            const childPrefix = prefix + (isLast ? "  " : "│ ");
            const nodePrefix = childPrefix + (isChildLast ? "└─" : "├─");

            return (
              <TreeNode
                key={child.contribution.id.toString()}
                node={child}
                onSelectNode={onSelectNode}
                selectedNodeId={selectedNodeId}
                isLast={isChildLast}
                prefix={nodePrefix}
                storyContentType={storyContentType}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ContributionTree({
  nodes,
  onSelectNode,
  selectedNodeId,
  storyContentType,
}: ContributionTreeProps) {
  if (nodes.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-gray-50 rounded-lg">
        <div className="text-4xl mb-2">🌱</div>
        <p className="text-gray-600 font-medium">No contributions yet</p>
        <p className="text-gray-500 text-sm mt-1">
          Be the first to start this story!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Story Tree Structure
        </h3>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {nodes.length} root contribution{nodes.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="space-y-1">
        {nodes.map((node, index) => (
          <TreeNode
            key={node.contribution.id.toString()}
            node={node}
            onSelectNode={onSelectNode}
            selectedNodeId={selectedNodeId}
            isLast={index === nodes.length - 1}
            prefix=""
            storyContentType={storyContentType}
          />
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <div className="font-medium mb-1">Legend:</div>
        <div className="space-y-1">
          <div>📄 Regular contribution • 🌿 Branch contribution</div>
          <div>Click on any contribution to view its content</div>
          <div>Use +/− to expand/collapse branches</div>
        </div>
      </div>
    </div>
  );
}
