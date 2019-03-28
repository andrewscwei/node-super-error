import assert from 'assert';
import { describe, it } from 'mocha';
import serializeError from 'serialize-error';
import { JsonObject } from 'type-fest';
import { SuperError } from '..';

describe('node-super-error', () => {
  it('can throw a SuperError', () => {
    const error = new SuperError();
    assert(!error.code);
    assert.throws(() => { throw error; });
  });

  it('can throw a SuperError with custom code', () => {
    const error = new SuperError('Hello, world!', 'FOO');
    assert(error.code === 'FOO');
    assert.throws(() => { throw error; });
  });

  it('can throw a SuperError with custom info', () => {
    const error = new SuperError('Hello, world!', undefined, { foo: 'bar' });
    assert(!error.code);
    assert(error.info && error.info.foo === 'bar');
    assert.throws(() => { throw error; });
  });

  it('can serialize a SuperError', () => {
    const error = new SuperError('Hello, world!', undefined, { foo: 'bar' });
    const serialized = serializeError(error);
    assert(serialized.name === 'SuperError');
    assert(!serialized.code);
    assert(serialized.info && (serialized.info as JsonObject).foo === 'bar');
    console.log(error.name);
    console.log(error.info);
  });
});
