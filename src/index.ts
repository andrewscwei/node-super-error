/** @license node-super-error
 * © Andrew Wei
 * This source code is licensed under the MIT license found in the LICENSE file in the root
 * directory of this source tree.
 */

import { deserializeError, ErrorObject, serializeError } from 'serialize-error'

/**
 * A plain object type representing a `SuperError`.
 */
export type SuperErrorObject = ErrorObject & {
  cause?: SuperErrorObject
  info?: { [key: string]: any}
}

/**
 * Custom `Error` that has optional `code` and `info` properties.
 */
export default class SuperError extends Error {

  /**
   * Optional causative `Error`.
   */
  readonly cause?: Error

  /**
   * Custom error code.
   */
  readonly code?: string

  /**
   * Custom info object.
   */
  readonly info?: { [key: string]: any }

  constructor(message?: string, code?: string, info?: { [key: string]: any }, cause?: Error) {
    super(message)

    // HACK: Support proper Error subclassing when transpiling to ES5.
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
   * Serializes a `SuperError` into a plain object.
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
   * Deserializes any value to an `Error` instance. If the value can be deserialized into a
   * `SuperError`, the return type will be `SuperError` instead of `Error`.
   *
   * @param value - Any value.
   *
   * @returns An `Error` if the value can be deserialized, `undefined` otherwise.
   */
  static deserialize(value: any): Error | undefined {
    if (value instanceof SuperError) return value

    const deserialized = deserializeError(value)

    return (deserialized instanceof Error) ? this.from(deserialized) : undefined
  }

  /**
   * Instantiates a `SuperError` from an `Error` instance.
   *
   * @param error - The `Error` instance.
   *
   * @returns The `SuperError`.
   */
  static from(error: Error): SuperError {
    const cause = ('cause' in error) && (error as any).cause ? this.deserialize((error as any).cause) : undefined
    const code: string | undefined = 'code' in error ? (error as any).code : undefined
    const info: { [key: string]: any } | undefined = 'info' in error && Object.prototype.toString.call((error as any).info) === '[object Object]' ? (error as any).info : undefined
    const newError = new SuperError(error.message, code , info, cause)
    newError.stack = error.stack
    return newError
  }
}
