// Utility to robustly parse LLM JSON output, auto-fixing common issues
import { jsonrepair } from 'jsonrepair';

/**
 * Attempts to parse a string as JSON, repairing common LLM output errors.
 * Throws with a clear error if repair fails.
 */
export function safeJsonParse<T = any>(raw: string): T {
  try {
    return JSON.parse(raw);
  } catch (err) {
    try {
      // Try to repair and parse
      const repaired = jsonrepair(raw);
      return JSON.parse(repaired);
    } catch (repairErr) {
      throw new Error(
        'Failed to parse and repair JSON. Original error: ' +
          (err instanceof Error ? err.message : String(err)) +
          '\nRepair error: ' +
          (repairErr instanceof Error ? repairErr.message : String(repairErr)) +
          '\nRaw string: ' + raw.slice(0, 1000) // limit log size
      );
    }
  }
}
