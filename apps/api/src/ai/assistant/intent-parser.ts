export interface ParsedAction {
  tool_name: string;
  parameters: Record<string, unknown>;
  requires_confirmation: boolean;
  description: string;
}

export interface ParsedResponse {
  message: string;
  actions: ParsedAction[];
  has_pending_confirmations: boolean;
}

export function parseAssistantResponse(
  textContent: string,
  toolUses: Array<{ name: string; input: Record<string, unknown> }>,
  writeTools: string[],
): ParsedResponse {
  const actions: ParsedAction[] = toolUses.map(tool => ({
    tool_name: tool.name,
    parameters: tool.input,
    requires_confirmation: writeTools.includes(tool.name),
    description: `Execute ${tool.name} with provided parameters`,
  }));

  return {
    message: textContent,
    actions,
    has_pending_confirmations: actions.some(a => a.requires_confirmation),
  };
}
