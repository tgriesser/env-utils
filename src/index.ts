import fs from "fs";
import dotenv from "dotenv";
import path from "path";

export type GetEnvFromOptions = {
  /**
   * Require the env variable exist, default true
   *
   * @default true
   */
  require?: boolean;

  /**
   * Whether empty string values should be permitted,
   *
   * @default false
   */
  allowEmpty?: boolean;

  /**
   * A fallback value for when require is false:
   *
   * @default undefined
   */
  fallback?: string;
};

type HasValue = ({ require: true } | { fallback: string }) & GetEnvFromOptions;

const cachedEnv: { [key: string]: Record<string, string | undefined> } = {};
const DEFAULT_OPTS = { require: true };

export function getEnv(envVar: string, options?: HasValue): string;
export function getEnv(
  envVar: string,
  options?: GetEnvFromOptions
): string | null;
export function getEnv(
  envVar: string,
  options: GetEnvFromOptions = DEFAULT_OPTS
): string | null {
  return getEnvVar("getEnv", process.env, envVar, options);
}

const ensureAbsolute = (filePath: string) => {
  if (!path.isAbsolute(filePath)) {
    throw new Error("getEnvFrom requires an absolute filepath");
  }
};

const loadAndCache = (filePath: string) => {
  const file = fs.readFileSync(filePath);
  cachedEnv[filePath] = dotenv.parse(file);
  return cachedEnv[filePath];
};

const loadedEnvs = new Set();

export function hasLoadedEnv(filePath: string): boolean {
  return loadedEnvs.has(filePath);
}

/**
 * Manually load environment variables from a file path or paths.
 *
 * If overwrite is specified as true, it will overwrite variables,
 * otherwise it will only load them if they're not yet set on process.env.
 *
 * @param filePath string | string[]
 * @param overwrite boolean
 */
export function loadEnv(
  filePath: string | string[],
  overwrite: boolean = false,
  reload: boolean = false,
) {
  const filePaths = Array.isArray(filePath) ? filePath : filePath ? [filePath] : [];
  if (filePaths.length === 0) {
    throw new Error('loadEnv: no file paths specified to load');
  }
  filePaths.forEach(filePath => {
    ensureAbsolute(filePath);
    if (!reload && loadedEnvs.has(filePath)) {
      throw new Error(
        `loadEnv: ${filePath} has already been loaded into process.env`
      );
    }
    loadedEnvs.add(filePath);
  });
  const envVarSets = filePaths.map(filePath => loadAndCache(filePath));
  envVarSets.forEach(envVars => {
    Object.keys(envVars).forEach(key => {
      if (overwrite === true) {
        process.env[key] = envVars[key];
      } else if (!(key in process.env)) {
        process.env[key] = envVars[key];
      }
    });
  });
}

/**
 * Get an env var from a specific file
 *
 * @param filePath string
 * @param envVar string
 * @param options { require?: boolean; allowEmpty?: boolean; fallback?: string; }
 */
export function getEnvFrom(
  filePath: string,
  envVar: string,
  options?: HasValue
): string;
export function getEnvFrom(
  filePath: string,
  envVar: string,
  options?: GetEnvFromOptions
): string | null;
export function getEnvFrom(
  filePath: string,
  envVar: string,
  options: GetEnvFromOptions = DEFAULT_OPTS
): string | null {
  ensureAbsolute(filePath);
  if (cachedEnv[filePath]) {
    return getEnvVar("getEnvFrom", cachedEnv[filePath], envVar, options);
  }
  return getEnvVar("getEnvFrom", loadAndCache(filePath), envVar, options);
}

const getEnvVar = (
  method: string,
  fullEnv: Record<string, string | undefined>,
  envVar: string,
  options: GetEnvFromOptions
) => {
  const keyExists = envVar in fullEnv;
  if (!keyExists) {
    if (options.fallback) {
      return options.fallback;
    }
    if (options.require !== false) {
      throw new Error(`${method}: Missing required key ${envVar}`);
    }
    return null;
  }
  const value = fullEnv[envVar]!;
  if (value === "") {
    if (options.allowEmpty) {
      return value;
    }
    if (options.fallback) {
      return options.fallback;
    }
    throw new Error(`${method}: Saw empty value for key ${envVar}`);
  }
  return value;
};
