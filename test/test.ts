import path from "path";
const { getEnvFrom, getEnv } = require("../src");

const startEnv = Object.assign({}, process.env);
const ENV_PATH = path.join(__dirname, ".env.test");
const ENV_LOCAL = path.join(__dirname, ".env.local.test");

let loadEnv;
beforeEach(() => {
  process.env = Object.assign({}, startEnv);
  const envUtils = require("../src");
  loadEnv = envUtils.loadEnv;
});

afterEach(() => {
  jest.resetModules();
});

describe("getEnv", () => {
  it("should get a process.env value", () => {
    expect(getEnv("NODE_ENV")).toEqual("test");
  });
  it("should error on a non-existent value", () => {
    expect(() => getEnv("NON_EXISTENT_KEY")).toThrow("getEnv: Missing");
  });
  it("should not error on a non-existent value with {require: false}", () => {
    expect(getEnv("NON_EXISTENT_KEY", { require: false })).toEqual(null);
  });
  it("should error on an empty value", () => {
    process.env.SET_EMPTY = "";
    expect(() => getEnv("SET_EMPTY")).toThrow("getEnv: Saw");
  });
  it("should not error on an empty value with {allowEmpty: true}", () => {
    process.env.SET_EMPTY = "";
    expect(getEnv("SET_EMPTY", { allowEmpty: true })).toEqual("");
  });
  it("should use fallback on empty value", () => {
    process.env.SET_EMPTY = "";
    expect(getEnv("SET_EMPTY", { fallback: "FALLBACK" })).toEqual("FALLBACK");
  });
  it("should use fallback fn on empty value", () => {
    process.env.SET_EMPTY = "";
    expect(getEnv("SET_EMPTY", { fallback: () => "FALLBACK" })).toEqual("FALLBACK");
  });
});

describe("loadEnv", () => {
  it("should load a path into process.env", () => {
    loadEnv(ENV_PATH);
    expect(getEnv("A")).toEqual("1");
  });
  it("should load multiple paths into process.env", () => {
    loadEnv([ENV_LOCAL, ENV_PATH]);
    expect(getEnv("A")).toEqual("0");
  });
  it("should overwrite with overwrite: true", () => {
    loadEnv([ENV_LOCAL, ENV_PATH], true);
    expect(getEnv("A")).toEqual("1");
  });
  it("should throw when loading the same file twice", () => {
    expect(() => loadEnv([ENV_LOCAL, ENV_LOCAL])).toThrow("loadEnv: ");
  });
  it("should throw when no files are specified", () => {
    expect(() => loadEnv()).toThrow("loadEnv: ");
    expect(() => loadEnv([])).toThrow("loadEnv: ");
  });
  it("should not throw when loading the same file twice, if reload = true", () => {
    expect(() => loadEnv([ENV_LOCAL, ENV_LOCAL], false, true)).not.toThrow();
  });
});

describe("getEnvFrom", () => {
  it("should take an absolute path", () => {
    expect(getEnvFrom(ENV_PATH, "KEY")).toEqual("VALUE");
  });

  it("should throw on a non-existent file", () => {
    expect(() => {
      getEnvFrom(path.join(__dirname, ".env.fail"), "KEY");
    }).toThrow("ENOENT: no such file or directory");
  });

  it("should fail on a relative path", () => {
    expect(() => {
      getEnvFrom("./.env.fail", "KEY");
    }).toThrow("getEnvFrom requires an absolute filepath");
  });

  it("should fail on a non-existent key", () => {
    expect(() => {
      getEnvFrom(ENV_PATH, "MISSING");
    }).toThrow("getEnvFrom: Missing required key MISSING");
  });

  it("should not fail on a non-existent key with {require: false}", () => {
    expect(getEnvFrom(ENV_PATH, "MISSING", { require: false })).toEqual(null);
  });

  it("should not fail on a non-existent key with a fallback", () => {
    expect(getEnvFrom(ENV_PATH, "MISSING", { fallback: "Fallback" })).toEqual(
      "Fallback"
    );
  });
  it("should not fail on a non-existent key with a fallback fn", () => {
    expect(getEnvFrom(ENV_PATH, "MISSING", { fallback: () => "Fallback" })).toEqual(
      "Fallback"
    );
  });

  it("should fail on an empty key", () => {
    expect(() => {
      getEnvFrom(ENV_PATH, "EMPTY");
    }).toThrow("getEnvFrom: Saw empty value for key EMPTY");
  });

  it("should not fail on am empty key with {allowEmpty: true}", () => {
    expect(getEnvFrom(ENV_PATH, "EMPTY", { allowEmpty: true })).toEqual("");
  });
});
