//

import { isProd } from "../lib/config/env";

/**
 * Environment Variable Checker Utility
 * ------------------------------------
 * Ensures all required environment variables are defined.
 * Supports nested objects and provides clear, contextual error messages.
 */

export function envChecker<T extends Record<string, any>>(
  envConfig: T,
  parentKey = "",
): asserts envConfig is Required<T> {
  Object.entries(envConfig).forEach(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}/${key}` : key;

    // 1️⃣ Recursive check for nested config objects
    if (typeof value === "object" && value !== null) {
      envChecker(value, fullKey);
      return;
    }

    // 2️⃣ Check for missing / empty environment variable
    if (value === undefined || value === null || value === "") {
      const errorMessage = `❌ Environment variable "${fullKey}" is missing or empty.`;
      console.error(errorMessage);
      throw new Error(errorMessage); // TODO: change the Error to ApiError
    }
  });

  // Optional: Success message in non-production environments
  if (!isProd && !parentKey) {
    console.log(
      "✅ All required environment variables are loaded successfully.",
    );
  }
}
