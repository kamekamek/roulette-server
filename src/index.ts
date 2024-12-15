#!/usr/bin/env node

/**
 * このMCPサーバーは、サイコロのシミュレーションを実装しています。
 * 以下の機能を提供します：
 * - サイコロを振るツール
 * - サイコロの結果を保存するリソース
 * - サイコロの履歴を表示するプロンプト
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * サイコロの結果を表すタイプ
 */
type DiceRoll = { timestamp: number, result: number };

/**
 * サイコロの結果を保存するための簡単なインメモリストレージ
 * 実際の実装では、データベースを使用する可能性があります
 */
const diceRolls: DiceRoll[] = [];

/**
 * リソース、ツール、プロンプトの機能を持つMCPサーバーを作成します
 */
const server = new Server(
  {
    name: "roulette-server2",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

/**
 * サイコロの結果をリソースとしてリストするためのハンドラー
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: diceRolls.map((roll, index) => ({
      uri: `dice:///${index}`,
      mimeType: "application/json",
      name: `サイコロの結果 ${index + 1}`,
      description: `タイムスタンプ: ${new Date(roll.timestamp).toLocaleString()}, 結果: ${roll.result}`
    }))
  };
});

/**
 * 特定のサイコロの結果を読み取るためのハンドラー
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const url = new URL(request.params.uri);
  const id = parseInt(url.pathname.replace(/^\//, ''), 10);
  const roll = diceRolls[id];

  if (!roll) {
    throw new Error(`サイコロの結果 ${id} が見つかりません`);
  }

  return {
    contents: [{
      uri: request.params.uri,
      mimeType: "application/json",
      text: JSON.stringify(roll, null, 2)
    }]
  };
});

/**
 * 利用可能なツールをリストするハンドラー
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "roll_dice",
        description: "サイコロを振る",
        inputSchema: {
          type: "object",
          properties: {
            sides: {
              type: "number",
              description: "サイコロの面の数（デフォルトは6）",
              default: 6
            }
          }
        }
      }
    ]
  };
});

/**
 * サイコロを振るツールのハンドラー
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "roll_dice": {
      const sides = Number(request.params.arguments?.sides) || 6;
      const result = Math.floor(Math.random() * sides) + 1;
      const roll: DiceRoll = { timestamp: Date.now(), result };
      diceRolls.push(roll);

      return {
        content: [{
          type: "text",
          text: `サイコロを振りました。結果: ${result}`
        }]
      };
    }

    default:
      throw new Error("不明なツールです");
  }
});

/**
 * 利用可能なプロンプトをリストするハンドラー
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "dice_history",
        description: "サイコロの履歴を表示",
      }
    ]
  };
});

/**
 * サイコロの履歴を表示するプロンプトのハンドラー
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  if (request.params.name !== "dice_history") {
    throw new Error("不明なプロンプトです");
  }

  const embeddedRolls = diceRolls.map((roll, index) => ({
    type: "resource" as const,
    resource: {
      uri: `dice:///${index}`,
      mimeType: "application/json",
      text: JSON.stringify(roll, null, 2)
    }
  }));

  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: "以下のサイコロの履歴を要約してください："
        }
      },
      ...embeddedRolls.map(roll => ({
        role: "user" as const,
        content: roll
      })),
      {
        role: "user",
        content: {
          type: "text",
          text: "上記のサイコロの履歴の簡潔な要約を提供してください。"
        }
      }
    ]
  };
});

/**
 * stdioトランスポートを使用してサーバーを起動します
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("サーバーエラー:", error);
  process.exit(1);
});
