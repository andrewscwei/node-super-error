/** @license node-super-error
 * © Andrew Wei
 * This source code is licensed under the MIT license found in the LICENSE file in the root
 * directory of this source tree.
 */

import isPlainObject from 'is-plain-obj'
import { ErrorObject, serializeError } from 'serialize-error'

/**
 * A plain object type representing a {@link SuperError}.
 */
export type SuperErrorObject = ErrorObject & {
  cause?: SuperErrorObject
  info?: { [key: string]: any}
}

/**
 * Type guard function for checking if a value conforms to a {@link SuperErrorObject}.
 *
 * @param value - Any value.
 *
 * @returns `true` if the value conforms to a {@link SuperErrorObject}, `false` otherwise.
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
 * A serializable and extendable {@link Error} with optional `code`, `info` and `cause` properties.
 */
export default class SuperError extends Error {

  /**
   * An arbitrary cause of this error.
   */
  readonly cause?: Error

  /**
   * An arbitrary error code.
   */
  readonly code?: string

  /**
   * A plain object containing arbitrary info.
   */
  readonly info?: { [key: string]: any }

  constructor(message?: string, code?: string, info?: { [key: string]: any }, cause?: Error) {
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
   * Serializes any error into a plain object representing a {@link SuperError}.
   *
   * @param error - The error to serialize.
   *
   * @returns The plain object.
   */
  static serialize(error: unknown): SuperErrorObject {
    const serialized = serializeError(error) as SuperErrorObject
    return serialized
  }

  /**
   * Deserializes any value to a {@link SuperError} instance. {@link SuperError}s are passed
   * through, and {@link Error}s are converted to {@link SuperError}s. Plain objects are
   * deserialized to match their keys to respective {@link SuperError} properties. Strings are
   * wrapped as the message of a {@link SuperError} and numbers are wrapped as the code of a
   * {@link SuperError}. Everything else are wrapped as the cause of a {@link SuperError}.
   *
   * @param value - Any value.
   *
   * @returns The deserialized {@link SuperError}.
   *
   * @alias SuperError.from
   */
  static deserialize(value: unknown): SuperError {
    try {
      return this.deserializeStrict(value)
    }
    catch (err) {
      if (value instanceof SuperError) {
        const newError = new SuperError(value.message, value.code, value.info, value.cause)
        newError.stack = value.stack
        return value
      }
      else if (value instanceof Error) {
        const newError = new SuperError(value.message, undefined, undefined, (value as any)['cause'])
        newError.stack = value.stack
        return newError
      }
      else if (typeof value === 'string') {
        return new SuperError(value)
      }
      else if (typeof value === 'number') {
        return new SuperError(undefined, `${value}`)
      }
      else if (isPlainObject(value)) {
        return new SuperError(undefined, undefined, value)
      }
      else {
        return new SuperError()
      }
    }
  }

  /**
   * Converts any value to a {@link SuperError} instance. {@link SuperError}s are cloned and
   * returned, and {@link Error}s are converted to {@link SuperError}s. Plain objects are
   * deserialized to match their keys to respective {@link SuperError} properties. Strings are
   * wrapped as the message of a {@link SuperError} and numbers are wrapped as the code of a
   * {@link SuperError}. Everything else are wrapped as the cause of a {@link SuperError}.
   *
   * @param value - Any value.
   *
   * @returns The {@link SuperError}.
   *
   * @alias SuperError.deserialize
   */
  static from(value: unknown): SuperError {
    return this.deserialize(value)
  }

  /**
   * Flattens any value that can be deserialized to a {@link SuperError} into an array of {@link
   * SuperError}s starting with the root error followed by each subsequent cause.
   *
   * @param value - Any value.
   *
   * @returns An array of {@link SuperError}s.
   */
  static flatten(value: unknown): SuperError[] {
    let curr: SuperError | undefined = this.deserialize(value)
    const errors: SuperError[] = []

    while (curr !== undefined) {
      errors.push(curr)
      curr = curr.cause
    }

    return errors
  }

  /**
   * Deserializes any value to a {@link SuperError} only if the value conforms to a
   * {@link SuperErrorObject}. If not, a {@link TypeError} is thrown. If the value is already a
   * {@link SuperError}, it is simply passed through.
   *
   * @param value - Any value.
   *
   * @returns The deserialized {@link SuperError} if applicable, or the original value if not
   *          applicable.
   *
   * @throws {TypeError} when unable to deserialize the value into a {@link SuperError}.
   */
  private static deserializeStrict(value: unknown): SuperError {
    if (value instanceof SuperError) return value

    if (typeIsSuperErrorObject(value)) {
      const newError = new SuperError(value.message, value.code, value.info, value.cause && this.deserialize(value.cause))
      newError.stack = value.stack
      return newError
    }

    throw TypeError(`Unable to deserialize value <${JSON.stringify(value)}> to SuperError`)
  }

  /**
   * @inheritdoc
   */
  toString(): string {
    return `${this.name}${this.code === undefined ? '' : `[${this.code}]`}: ${this.message}`
  }
}
