# node-super-error [![npm](https://img.shields.io/npm/v/@andrewscwei/super-error.svg)](https://www.npmjs.com/package/@andrewscwei/super-error) [![CI](https://github.com/andrewscwei/node-super-error/workflows/CI/badge.svg)](https://github.com/andrewscwei/node-super-error/actions?query=workflow%3ACI) [![CD](https://github.com/andrewscwei/node-super-error/workflows/CD/badge.svg)](https://github.com/andrewscwei/node-super-error/actions?query=workflow%3ACD)

A serializable and extendable Node.js `Error` with optional `code`, `info` and `cause` properties.

```ts
import SuperError from '@andrewscwei/super-error'

const cause = new Error('I am the cause')
const error = new SuperError('I am the error', 'error-code', { some: 'info' }, cause)

console.log(error.name) // 'SuperError'
console.log(error.code) // 'error-code'
console.log(error.info) // { some: 'info' }
console.log(error.cause) // cause

const serialized = SuperError.serialize(error) // { 'name': 'SuperError', 'code': 'error-code', 'info': { 'some': 'info' }, 'cause': { 'name': 'Error', 'message': 'I am the cause' }, 'stack': <error_stack> }
const deserialized = SuperError.deserialize(serialized) // A `SuperError` instance equivalent to the initially created `error`.
```

## API

### Class: `SuperError`

A serializable and extendable `Error` with optional `code`, `info` and `cause` properties.

#### Property: `{Error}` `cause`

An arbitrary causative `Error`.

#### Property: `{string}` `code`

An arbitrary error code.

#### Property: `{object}` `info`

A plain object containing arbitrary info.

#### Method: `SuperError.serialize(error)`

Serializes any `Error` into a plain object representing a `SuperError`.

- `@param value: Error` — Any `Error`.
- `@returns SuperErrorObject` — A plain object representing a `SuperError`.

#### Method: `SuperError.deserialize(value)`

Deserializes any value to an `Error` instance. If the value can be deserialized into a `SuperError`, the return type will be `SuperError` instead of `Error`.

- `@param value: any` — Any value.
- `@returns Error | undefined` — The deserialized `Error` if applicable, `undefined` otherwise.

#### Method: `SuperError.from(error)`

Creates a `SuperError` from an `Error` instance.

- `@param error` — Any `Error`.
- `@returns SuperError` — The created `SuperError`.

## Usage

```sh
# Install dependencies
$ npm install

# Build module
$ npm run build

# Run tests against src
$ npm run test:ts

# Run tests against src for specific file patterns (relative to /src)
$ npm run test:ts --files="foo.ts"

# Run tests again built files
$ npm test

# Run tests again built files for specific file patterns (relative to /build)
$ npm test --files="foo.js"
```
