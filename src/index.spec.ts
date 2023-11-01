/* eslint-disable no-console, max-classes-per-file */

import assert from 'assert'
import { describe, it } from 'mocha'
import SuperError from './index.js'

describe('node-super-error', () => {
  it('SuperError extends Error properly', () => {
    const error = new SuperError()
    assert(error.name === SuperError.name)
    assert(error instanceof Error)
    assert(error instanceof SuperError)
  })

  it('can extend SuperError properly', () => {
    class FooError extends SuperError {}
    const error = new FooError()
    assert(error.name === FooError.name)
    assert(error instanceof Error)
    assert(error instanceof SuperError)
    assert(error instanceof FooError)
  })

  it('can throw a SuperError', () => {
    const error = new SuperError()
    assert(!error.code)
    assert.throws(() => { throw error })
  })

  it('can throw a SuperError with custom code', () => {
    const error = new SuperError('Hello, world!', 'foo')
    assert(error.code === 'foo')
    assert.throws(() => { throw error })
  })

  it('can throw a SuperError with custom info', () => {
    const error = new SuperError('Hello, world!', undefined, { foo: 'bar' })
    assert(!error.code)
    assert(error.info && error.info.foo === 'bar')
    assert.throws(() => { throw error })
  })

  it('can serialize a SuperError', () => {
    const error = new SuperError('Hello, world!', 'foo', { foo: 'bar' })
    const serialized = SuperError.serialize(error)
    assert(serialized.name === SuperError.name)
    assert(serialized.code === 'foo')
    assert(serialized.info?.foo === 'bar')
    assert(serialized.stack)
    console.log('Serialized error:', serialized)
  })

  it('can serialize a SuperError subclass', () => {
    class FooError extends SuperError {}
    const error = new FooError('Hello, world!', 'foo', { foo: 'bar' })
    const serialized = SuperError.serialize(error)
    assert(serialized.name === FooError.name)
    assert(serialized.code === 'foo')
    assert(serialized.info?.foo === 'bar')
    assert(serialized.stack)
    console.log('Serialized error:', serialized)
  })

  it('can serialize a SuperError with a cause', () => {
    const cause = new SuperError('Hello, another world!', 'bar', { bar: 'baz' })
    const error = new SuperError('Hello, world!', 'foo', { foo: 'bar' }, cause)
    const serialized = SuperError.serialize(error)
    assert(serialized.name === SuperError.name)
    assert(serialized.code === 'foo')
    assert(serialized.info?.foo === 'bar')
    assert(serialized.stack)
    assert(serialized.cause)
    assert((serialized.cause as any).name === SuperError.name)
    assert((serialized.cause as any).code === 'bar')
    assert((serialized.cause as any).info?.bar === 'baz')
    assert((serialized.cause as any).stack)
  })

  it('can deserialize a SuperError', () => {
    const error = new SuperError('Hello, world!', 'foo', { foo: 'bar' })
    const serialized = SuperError.serialize(error)
    const deserialized = SuperError.deserialize(serialized)
    assert(deserialized instanceof Error)
    assert(deserialized instanceof SuperError)
    console.log('Deserialized error:', deserialized)
  })

  it('can deserialize a SuperError with a cause', () => {
    const cause = new SuperError('Hello, another world!', 'bar', { bar: 'baz' })
    const error = new SuperError('Hello, world!', 'foo', { foo: 'bar' }, cause)
    const serialized = SuperError.serialize(error)
    const deserialized = SuperError.deserialize(serialized)
    assert(deserialized instanceof Error)
    assert(deserialized instanceof SuperError)
    console.log('Deserialized error:', deserialized)
  })

  it('can deserialize a SuperError subclass', () => {
    class FooError extends SuperError {}
    const error = new FooError('Hello, world!', 'foo', { foo: 'bar' })
    const serialized = FooError.serialize(error)
    const deserialized = FooError.deserialize(serialized)
    assert(deserialized instanceof Error)
    assert(deserialized instanceof SuperError)
    console.log(FooError.deserialize(error).toString())
    console.log('Deserialized error:', deserialized)
  })
})
