import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { getToolLabel, ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// getToolLabel unit tests

test("str_replace_editor create → in-progress", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "create", path: "src/App.tsx" }, false)
  ).toBe("Creating App.tsx");
});

test("str_replace_editor create → done", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "create", path: "src/App.tsx" }, true)
  ).toBe("Created App.tsx");
});

test("str_replace_editor str_replace → in-progress", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "str_replace", path: "src/Button.tsx" }, false)
  ).toBe("Editing Button.tsx");
});

test("str_replace_editor str_replace → done", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "str_replace", path: "src/Button.tsx" }, true)
  ).toBe("Edited Button.tsx");
});

test("str_replace_editor insert → in-progress", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "insert", path: "src/Card.tsx" }, false)
  ).toBe("Editing Card.tsx");
});

test("str_replace_editor insert → done", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "insert", path: "src/Card.tsx" }, true)
  ).toBe("Edited Card.tsx");
});

test("str_replace_editor view → in-progress", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "view", path: "src/index.tsx" }, false)
  ).toBe("Viewing index.tsx");
});

test("str_replace_editor view → done", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "view", path: "src/index.tsx" }, true)
  ).toBe("Viewed index.tsx");
});

test("str_replace_editor undo_edit → in-progress", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "undo_edit", path: "src/index.tsx" }, false)
  ).toBe("Undoing edit on index.tsx");
});

test("str_replace_editor undo_edit → done", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "undo_edit", path: "src/index.tsx" }, true)
  ).toBe("Undone edit on index.tsx");
});

test("file_manager rename → in-progress", () => {
  expect(
    getToolLabel(
      "file_manager",
      { command: "rename", path: "src/Old.tsx", new_path: "src/New.tsx" },
      false
    )
  ).toBe("Renaming Old.tsx → New.tsx");
});

test("file_manager rename → done", () => {
  expect(
    getToolLabel(
      "file_manager",
      { command: "rename", path: "src/Old.tsx", new_path: "src/New.tsx" },
      true
    )
  ).toBe("Renamed Old.tsx → New.tsx");
});

test("file_manager delete → in-progress", () => {
  expect(
    getToolLabel("file_manager", { command: "delete", path: "src/utils.ts" }, false)
  ).toBe("Deleting utils.ts");
});

test("file_manager delete → done", () => {
  expect(
    getToolLabel("file_manager", { command: "delete", path: "src/utils.ts" }, true)
  ).toBe("Deleted utils.ts");
});

test("missing path falls back to generic label", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "create" }, false)
  ).toBe("Creating file");
});

test("unknown tool returns tool name as-is", () => {
  expect(getToolLabel("some_unknown_tool", {}, false)).toBe("some_unknown_tool");
});

// ToolInvocationBadge component tests

test("shows spinner when state is call", () => {
  const invocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "App.tsx" },
    state: "call",
  };
  render(<ToolInvocationBadge toolInvocation={invocation} />);
  expect(document.querySelector(".animate-spin")).toBeDefined();
  expect(document.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows spinner when state is partial-call", () => {
  const invocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "App.tsx" },
    state: "partial-call",
  };
  render(<ToolInvocationBadge toolInvocation={invocation} />);
  expect(document.querySelector(".animate-spin")).toBeDefined();
  expect(document.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot when state is result with truthy result", () => {
  const invocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "App.tsx" },
    state: "result",
    result: "Success",
  };
  render(<ToolInvocationBadge toolInvocation={invocation} />);
  expect(document.querySelector(".bg-emerald-500")).toBeDefined();
  expect(document.querySelector(".animate-spin")).toBeNull();
});

test("shows spinner when state is result but result is falsy", () => {
  const invocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "App.tsx" },
    state: "result" as const,
    result: "",
  };
  render(<ToolInvocationBadge toolInvocation={invocation} />);
  expect(document.querySelector(".animate-spin")).toBeDefined();
  expect(document.querySelector(".bg-emerald-500")).toBeNull();
});

test("renders human-readable label text", () => {
  const invocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "src/App.tsx" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={invocation} />);
  expect(screen.getByText("Created App.tsx")).toBeDefined();
});
