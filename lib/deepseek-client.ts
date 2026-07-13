/**
 * lib/deepseek-client.ts — 4 产品统一 DeepSeek 客户端（SM 版本）
 *
 * 生成于 2026-07-13（DeepSeek V4 迁移，方案 A 保守版）
 *
 * 目的：
 *   1. 消除 SM 10 个 route.ts 中 `model: "deepseek-chat"` 的硬编码重复
 *   2. 通过 env 双写实现 v3→v4 平滑迁移 + 双向回滚
 *   3. 7-24 后 `deepseek-chat` 别名下线，此文件是单点切换枢纽
 *
 * env 契约（Vercel Preview / Production 两套）：
 *   - DEEPSEEK_API_KEY        (required) — 现有
 *   - DEEPSEEK_MODEL_FLASH    (optional) — default 'deepseek-v4-flash'
 *   - DEEPSEEK_MODEL_PRO      (optional) — default 'deepseek-v4-pro'
 *
 * 双写行为：
 *   env 未铺 → 默认 v4-flash / v4-pro（7-24 后依然可用）
 *   env 铺 "deepseek-chat" → 走旧模型（7-24 前有效，作为紧急回滚）
 *   env 铺 "deepseek-v4-flash" → 显式确认走新模型
 */

import OpenAI from "openai";

export const MODEL_FLASH = process.env.DEEPSEEK_MODEL_FLASH ?? "deepseek-v4-flash";
export const MODEL_PRO = process.env.DEEPSEEK_MODEL_PRO ?? "deepseek-v4-pro";

const BASE_URL = "https://api.deepseek.com";

/**
 * 创建 OpenAI 兼容客户端（DeepSeek baseURL）
 * 抛错场景：DEEPSEEK_API_KEY 未配置 → 调用方需 return 500 AI_SERVICE_ERROR
 */
export function createDeepSeekClient(): OpenAI {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY_MISSING");
  }
  return new OpenAI({
    apiKey,
    baseURL: BASE_URL,
  });
}

/**
 * 便捷函数：使用 flash 模型（默认业务模型）
 */
export function getFlashModel(): string {
  return MODEL_FLASH;
}

/**
 * 便捷函数：使用 pro 模型（audit / 长上下文场景）
 * 当前 SM 未启用，预留给后续 audit endpoint 升级
 */
export function getProModel(): string {
  return MODEL_PRO;
}

/**
 * v4-flash JSON 输出兜底 helper（2026-07-13 W1 收尾新增）
 *
 * 背景：
 *   - 旧 deepseek-chat 通过 response_format:{type:"json_object"} 强制返回纯 JSON
 *   - v4-flash 对该参数支持不完整：偶发把 JSON 包在 ```json ... ``` markdown fence 里，
 *     或前后附带解释文字（W1 SL validator 实测 502 parse error 已复现）
 *   - 另外 v4-flash tokenizer 差异，旧 max_tokens 可能截断 JSON（需要调用方独立处理）
 *
 * 使用方式（推荐加在每个 route 的 JSON.parse 前）：
 *   import { parseJsonResponse } from "@/lib/deepseek-client";
 *   const parsed = parseJsonResponse(completion.choices[0].message.content ?? "");
 *
 * 注意：
 *   - 本次 W1 收尾**只新增此 helper**，不强制替换 SM 10 个 route.ts 现有 JSON.parse
 *     调用（避免大范围回归风险）。后续可按 route 单点切换。
 *   - 若替换后 JSON.parse 仍抛错，说明是 max_tokens 截断（非 markdown 包裹），
 *     需调用方独立在请求 body 里把 max_tokens 从 900 类小值调到 1800+
 */
export function stripJsonMarkdown(raw: string): string {
  let s = (raw || "").trim();
  // 移除 ```json ... ``` 或 ``` ... ``` 包裹
  const fence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/i;
  const m = s.match(fence);
  if (m) s = m[1].trim();
  // 截取第一个 { 到最后一个 }（去掉前后解释文字），兼容根节点为 object 的场景
  const firstBrace = s.indexOf("{");
  const lastBrace = s.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    // 若整体已经被 [] 包裹（数组根），保留原样；仅当 { 出现且 [ 未出现在更前面时才裁剪
    const firstBracket = s.indexOf("[");
    if (firstBracket < 0 || firstBrace < firstBracket) {
      s = s.substring(firstBrace, lastBrace + 1);
    }
  }
  return s;
}

/**
 * 兜底 JSON parse：先 strip markdown / 前后噪声，再 JSON.parse
 * 抛错时错误对象带 rawSnippet 供上层日志排查（<= 200 字符，不含 PII，仅 LLM 输出）
 */
export function parseJsonResponse<T = unknown>(raw: string | null | undefined): T {
  const cleaned = stripJsonMarkdown(raw ?? "");
  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    const snippet = (raw ?? "").slice(0, 200);
    const e = new Error(
      `DEEPSEEK_JSON_PARSE_ERROR: could not parse LLM response as JSON. head=${snippet}`
    );
    (e as any).rawSnippet = snippet;
    (e as any).cause = err;
    throw e;
  }
}
