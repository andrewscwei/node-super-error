# node-super-error [![npm](https://img.shields.io/npm/v/@andrewscwei/super-error.svg)](https://www.npmjs.com/package/@andrewscwei/super-error) [![CI](https://github.com/andrewscwei/node-super-error/workflows/CI/badge.svg)](https://github.com/andrewscwei/node-super-error/actions/workflows/ci.yml) [![CD](https://github.com/andrewscwei/node-super-error/workflows/CD/badge.svg)](https://github.com/andrewscwei/node-super-error/actions/workflows/cd.yml)

A serializable and extendable Node.js `Error` with optional `code`, `info` and `cause` properties.

```ts
import { SuperError } from "@andrewscwei/super-error";

const cause = new Error("I am the cause");
const error = new SuperError(
  "I am the error",
  "error-code",
  { some: "info" },
  cause
);

console.log(error.name); // 'SuperError'
console.log(error.code); // 'error-code'
console.log(error.info); // { some: 'info' }
console.log(error.cause); // cause

const serialized = SuperError.serialize(error); // { 'name': 'SuperError', 'code': 'error-code', 'info': { 'some': 'info' }, 'cause': { 'name': 'Error', 'message': 'I am the cause' }, 'stack': <error_stack> }
const deserialized = SuperError.deserialize(serialized); // A `SuperError` instance equivalent to the initially created `error`.
```

## API

### Class: `SuperError`

A serializable and extendable `Error` with optional `code`, `info` and `cause` properties.

#### Property: `{unknown}` `cause`

An arbitrary cause of this error.

#### Property: `{string}` `code`

An arbitrary error code.

#### Property: `{object}` `info`

A plain object containing arbitrary info.

#### Method: `SuperError.serialize(error)`

Serializes any error into a plain object representing a `SuperError`.

- `@param value: unknown` — Any error.
- `@returns SuperErrorObject` — A plain object representing a `SuperError`.

#### Method: `SuperError.deserialize(value)`

Deserializes any value to a `SuperError` instance. `SuperError`s are passed through, and `Error`s are converted to `SuperError`s. Plain objects are deserialized to match their keys to respective `SuperError` properties. Strings are wrapped as the message of a `SuperError` and numbers are wrapped as the code of a `SuperError`. Everything else are wrapped as the cause of a `SuperError`.

- `@param value: unknown` — Any value.
- `@returns SuperError` — The deserialized `SuperError`.

#### Method: `SuperError.from(value)`

This method is an alias of `SuperError.deserialize(value)`.

## Usage

```sh
# Install dependencies
$ npm install

# Build module
$ npm run build

# Run tests against src
$ npm run unit

# Run tests against src for specific file patterns (relative to /src)
$ npm run unit --files="foo.ts"

# Run tests again built files
$ npm test

# Run tests again built files for specific file patterns (relative to /build)
$ npm test --files="foo.js"
```
