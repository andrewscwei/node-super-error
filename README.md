# node-super-error [![CI](https://github.com/andrewscwei/node-super-error/workflows/CI/badge.svg)](https://github.com/andrewscwei/node-super-error/actions?query=workflow%3ACI) [![CD](https://github.com/andrewscwei/node-super-error/workflows/CD/badge.svg)](https://github.com/andrewscwei/node-super-error/actions?query=workflow%3ACD)

Custom error for Node.js with additional properties:

```ts
const error = new SuperError('Hello, world!', 'FOO', { foo: 'bar' });

console.log(error.name); // 'SuperError'
console.log(error.code); // 'FOO'
console.log(error.info); // { foo: 'bar' }
```
