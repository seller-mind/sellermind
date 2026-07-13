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
