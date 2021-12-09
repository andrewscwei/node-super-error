/** @license node-super-error
 * © Andrew Wei
 * This source code is licensed under the MIT license found in the LICENSE file in the root
 * directory of this source tree.
 */

import isPlainObject from 'is-plain-obj'
import { ErrorObject, serializeError } from 'serialize-error'

/**
 * A plain object type representing a `SuperError`.
 */
export type SuperErrorObject = ErrorObject & {
  cause?: SuperErrorObject
  info?: { [key: string]: any}
}

/**
 * Type guard function for checking if a value conforms to a `SuperErrorObject`.
 *
 * @param value - Any value.
 *
 * @returns `true` if the value conforms to a `SuperErrorObject`, `false` otherwise.
 */
export function typeIsSuperErrorObject(value: any): value is SuperErrorObject {
  if (value === null || value === undefined) return false
  if ('message' in value && typeof (value as any).message === 'string') return true
  if ('code' in value && typeof (value as any).code === 'string') return true
  if ('info' in value && isPlainObject((value as any).info)) return true
  if ('cause' in value) return true
  if ('stack' in value && typeof (value as any).stack === 'string') return true
  return false
}

/**
 * A serializable and extendable `Error` with optional `code`, `info` and `cause` properties.
 */
export default class SuperError extends Error {

  /**
   * An arbitrary cause of this error.
   */
  readonly cause?: unknown

  /**
   * An arbitrary error code.
   */
  readonly code?: string

  /**
   * A plain object containing arbitrary info.
   */
  readonly info?: { [key: string]: any }

  constructor(message?: string, code?: string, info?: { [key: string]: any }, cause?: unknown) {
    super(message)

    // HACK: Support proper `Error` subclassing when transpiling to ES5.
    const prototype = new.target.prototype

    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, prototype)
    }
    else {
      (this as any).__proto__ = prototype
    }

    this.name = this.constructor.name
    this.code = code
    this.info = info
    this.cause = cause
  }

  /**
   * Serializes any `Error` into a plain object representing a `SuperError`.
   *
   * @param error - The `SuperError` to serialize.
   *
   * @returns The plain object.
   */
  static serialize(error: Error): SuperErrorObject {
    const serialized = serializeError(error) as SuperErrorObject
    return serialized
  }

  /**
   * Deserializes any value to a `SuperError` instance. `SuperError`'s are cloned and returned, and
   * `Error`'s are converted to `SuperError`'s. Plain objects are deserialized to match their keys
   * to respective `SuperError` properties. Strings are wrapped as the message of a `SuperError` and
   * numbers are wrapped as the code of a `SuperError`. Everything else are wrapped as the cause of
   * a `SuperError`.
   *
   * @param value - Any value.
   *
   * @returns The deserialized `SuperError`.
   *
   * @alias SuperError.from
   */
  static deserialize(value: unknown): SuperError {
    const deserialized = this.deserializeStrict(value)

    if (deserialized instanceof SuperError) {
      return deserialized
    }
    else if (typeof deserialized === 'string') {
      return new SuperError(deserialized)
    }
    else if (typeof deserialized === 'number') {
      return new SuperError(undefined, `${deserialized}`)
    }
    else {
      return new SuperError(undefined, undefined, undefined, deserialized)
    }
  }

  /**
   * Converts any value to a `SuperError` instance. `SuperError`'s are cloned and returned, and
   * `Error`'s are converted to `SuperError`'s. Plain objects are deserialized to match their keys
   * to respective `SuperError` properties. Strings are wrapped as the message of a `SuperError` and
   * numbers are wrapped as the code of a `SuperError`. Everything else are wrapped as the cause of
   * a `SuperError`.
   *
   * @param value - Any value.
   *
   * @returns The `SuperError`.
   *
   * @alias SuperError.deserialize
   */
  static from(value: unknown): SuperError {
    const deserialized = this.deserializeStrict(value)

    if (deserialized instanceof SuperError) {
      return deserialized
    }
    else if (typeof deserialized === 'string') {
      return new SuperError(deserialized)
    }
    else if (typeof deserialized === 'number') {
      return new SuperError(undefined, `${deserialized}`)
    }
    else {
      return new SuperError(undefined, undefined, undefined, deserialized)
    }
  }

  /**
   * Deserializes any value to a `SuperError` only if the value conforms to a `SuperErrorObject`. If
   * not, the value is passed through.
   *
   * @param value - Any value
   * @returns The deserialized `SuperError` if applicable, or the original value if not applicable.
   */
  private static deserializeStrict(value: unknown): unknown {
    if (typeIsSuperErrorObject(value)) {
      const newError = new SuperError(value.message, value.code, value.info, this.deserializeStrict(value.cause))
      newError.stack = value.stack
      return newError
    }
    else {
      return value
    }
  }
}
