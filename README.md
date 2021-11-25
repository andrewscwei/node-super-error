# node-super-error [![npm](https://img.shields.io/npm/v/@andrewscwei/super-error.svg)](https://www.npmjs.com/package/@andrewscwei/super-error) [![CI](https://github.com/andrewscwei/node-super-error/workflows/CI/badge.svg)](https://github.com/andrewscwei/node-super-error/actions?query=workflow%3ACI) [![CD](https://github.com/andrewscwei/node-super-error/workflows/CD/badge.svg)](https://github.com/andrewscwei/node-super-error/actions?query=workflow%3ACD)

Custom error for Node.js with additional properties:

```ts
const error = new SuperError('Hello, world!', 'FOO', { foo: 'bar' });

console.log(error.name); // 'SuperError'
console.log(error.code); // 'FOO'
console.log(error.info); // { foo: 'bar' }
```

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
