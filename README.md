# @tgriesser/env-utils

A few helpers utilizing [dotenv](https://github.com/motdotla/dotenv) to load/retrieve a specific env variable from an env file.

### getEnv

Loads a variable from `process.env`, with a few options:

```
getEnv(envVar: string, options?: GetEnvFromOptions): string | null
```

#### GetEnvFromOptions:
```
{
  // If a value is specified, it is used in the case the value is not defined, 
  // or is empty (unless `allowEmpty` is `true`).
  fallback?: string (default: undefined),

  // Whether the value is required, otherwise an error will be thrown.
  require?: boolean (default: true),

  // Whether empty string values should be allowed, otherwise an error will be thrown.
  allowEmpty?: boolean (default: false),
}
```

### getEnvFrom

Retrieves an environment variable from a specific `filePath` with some additional options.

```
getEnvFrom(filePath: string, envVar: string, options?: GetEnvFromOptions): string | null
```

### loadEnv

Loads environment variables, will not overwrite set `process.env` unless overwrite is true. Will error if the environment has already been loaded, unless reload is true.

```
getEnvFrom(filePath: string | string[], overwrite: boolean = false, reload = false): string | null
```


#### 

License MIT