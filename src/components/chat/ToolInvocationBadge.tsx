import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

export function getToolLabel(
  toolName: string,
  args: Record<string, unknown>,
  isDone: boolean
): string {
  const path = typeof args.path === "string" ? args.path : undefined;
  const filename = path ? path.split("/").pop() : undefined;

  if (toolName === "str_replace_editor") {
    const command = args.command as string | undefined;
    if (!filename) {
      return isDone ? "Created file" : "Creating file";
    }
    switch (command) {
      case "create":
        return isDone ? `Created ${filename}` : `Creating ${filename}`;
      case "str_replace":
        return isDone ? `Edited ${filename}` : `Editing ${filename}`;
      case "insert":
        return isDone ? `Edited ${filename}` : `Editing ${filename}`;
      case "view":
        return isDone ? `Viewed ${filename}` : `Viewing ${filename}`;
      case "undo_edit":
        return isDone
          ? `Undone edit on ${filename}`
          : `Undoing edit on ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    const command = args.command as string | undefined;
    const newPath =
      typeof args.new_path === "string" ? args.new_path : undefined;
    const newFilename = newPath ? newPath.split("/").pop() : undefined;
    if (command === "rename" && filename && newFilename) {
      return isDone
        ? `Renamed ${filename} → ${newFilename}`
        : `Renaming ${filename} → ${newFilename}`;
    }
    if (command === "delete" && filename) {
      return isDone ? `Deleted ${filename}` : `Deleting ${filename}`;
    }
  }

  return toolName;
}

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolInvocationBadge({
  toolInvocation,
}: ToolInvocationBadgeProps) {
  const isDone =
    toolInvocation.state === "result" && !!toolInvocation.result;
  const label = getToolLabel(
    toolInvocation.toolName,
    toolInvocation.args as Record<string, unknown>,
    isDone
  );

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
