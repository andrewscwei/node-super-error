# node-super-error [![CircleCI](https://circleci.com/gh/andrewscwei/node-super-error.svg?style=svg)](https://circleci.com/gh/andrewscwei/node-super-error)

Custom error for Node.js with additional properties:

```ts
const error = new SuperError('Hello, world!', 'FOO', { foo: 'bar' });

console.log(error.name); // 'SuperError'
console.log(error.code); // 'FOO'
console.log(error.info); // { foo: 'bar' }
```
