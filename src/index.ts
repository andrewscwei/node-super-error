/** @license node-super-error
 * © Andrew Wei
 * This source code is licensed under the MIT license found in the LICENSE file
 * in the root directory of this source tree.
 */

import isPlainObject from 'is-plain-obj'
import { ErrorObject, serializeError } from 'serialize-error'

/**
 * A plain object type representing the info property of a {@link SuperError}.
 */
export type SuperErrorInfo = Record<string, any>

/**
 * A plain object type representing a {@link SuperError}.
 */
export type SuperErrorObject = ErrorObject & {
  cause?: unknown
  info?: SuperErrorInfo
}

/**
 * Type guard function for checking if a value conforms to a {@link SuperErrorObject}.
 *
 * @param value - Any value.
 *
 * @returns `true` if the value conforms to a {@link SuperErrorObject}, `false`
 *          otherwise.
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
 * A serializable and extendable {@link Error} with optional `code`, `info` and
 * `cause` properties.
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
  readonly info?: SuperErrorInfo

  constructor(message?: string, code?: string, info?: SuperErrorInfo, cause?: unknown) {
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
   * Deserializes any value to a {@link SuperError} instance.
   * {@link SuperError}s are passed through, and {@link Error}s are converted to
   * {@link SuperError}s. Plain objects are deserialized to match their keys to
   * respective {@link SuperError} properties. Strings are wrapped as the
   * message of a {@link SuperError} and numbers are wrapped as the code of a
   * {@link SuperError}. Everything else is wrapped as the cause of a
   * {@link SuperError}.
   *
   * @param value - Any value.
   *
   * @returns The deserialized {@link SuperError}.
   *
   * @alias SuperError.from
   */
  static deserialize(value: unknown): SuperError {
    if (value instanceof SuperError) {
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
    else {
      try {
        return this.deserializeStrict(value)
      }
      catch (err) {
        if (isPlainObject(value)) {
          return new SuperError(undefined, undefined, value)
        }
        else {
          return new SuperError()
        }
      }
    }
  }

  /**
   * Converts any value to a {@link SuperError} instance. {@link SuperError}s
   * are cloned and returned, and {@link Error}s are converted to
   * {@link SuperError}s. Plain objects are deserialized to match their keys to
   * respective {@link SuperError} properties. Strings are wrapped as the
   * message of a {@link SuperError} and numbers are wrapped as the code of a
   * {@link SuperError}. Everything else is wrapped as the cause of a
   * {@link SuperError}.
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
   * Flattens any value that can be deserialized to a {@link SuperError} into an
   * array of {@link SuperError}s, starting with the root error followed by each
   * subsequent cause.
   *
   * @param value - Any value.
   *
   * @returns An array of {@link SuperError}s.
   */
  static flatten(value: SuperError): unknown[] {
    let curr: unknown | undefined = value
    const errors: unknown[] = []

    while (curr !== undefined && curr !== null) {
      errors.push(curr)
      curr = (curr as any).cause
    }

    return errors
  }

  /**
   * Flattens any value that can be deserialized to a {@link SuperError} into an
   * array of error messages, starting with the root error message followed by
   * the error messages of each subsequent cause.
   *
   * @param value - Any value.
   * @param options.includeNil - Specifies if nil messages should be included
   *                             (by default they are dropped).
   *
   * @returns An array of error messages.
   */
  static flattenMessage<IncludeNil extends boolean = false>(value: SuperError, options?: { includeNil?: boolean }): IncludeNil extends true ? (string | undefined)[] : string[]
  static flattenMessage<IncludeNil extends boolean = false>(value: SuperError, { includeNil }: { includeNil?: IncludeNil } = {}): (string | undefined)[] {
    const flattened = this.flatten(value)

    return flattened.reduce<(string | undefined)[]>((prev, curr) => {
      const message = (curr as any).message
      if (typeof message === 'string') return [...prev, message]
      if (includeNil === true && (message === undefined || message === null)) return [...prev, undefined]
      return prev
    }, [])
  }

  /**
   * Flattens any value that can be deserialized to a {@link SuperError} into an
   * array of error codes, starting with the root error code followed by the
   * error code of each subsequent cause.
   *
   * @param value - Any value.
   * @param options.includeNil - Specifies if nil codes should be included (by
   *                             default they are dropped).
   *
   * @returns An array of error codes.
   */
  static flattenCode<IncludeNil extends boolean = false>(value: SuperError, options?: { includeNil?: IncludeNil }): IncludeNil extends true ? (string | undefined)[] : string[]
  static flattenCode<IncludeNil extends boolean = false>(value: SuperError, { includeNil }: { includeNil?: IncludeNil } = {}): (string | undefined)[] {
    const flattened = this.flatten(value)

    return flattened.reduce<(string | undefined)[]>((prev, curr) => {
      const code = (curr as any).code
      if (typeof code === 'string') return [...prev, code]
      if (includeNil === true && (code === undefined || code === null)) return [...prev, undefined]
      return prev
    }, [])
  }

  /**
   * Flattens any value that can be deserialized to a {@link SuperError} into an
   * array of error info, starting with the root error info followed by the
   * error info of each subsequent cause.
   *
   * @param value - Any value.
   * @param options.includeNil - Specifies if nil info should be included (by
   *                             default they are dropped).
   *
   * @returns An array of error info.
   */
  static flattenInfo<IncludeNil extends boolean = false>(value: SuperError, options?: { includeNil?: IncludeNil }): IncludeNil extends true ? (SuperErrorInfo | undefined)[] : SuperErrorInfo[]
  static flattenInfo<IncludeNil extends boolean = false>(value: SuperError, { includeNil }: { includeNil?: IncludeNil } = {}): (SuperErrorInfo | undefined)[] {
    const flattened = this.flatten(value)

    return flattened.reduce<(SuperErrorInfo | undefined)[]>((prev, curr) => {
      const info = (curr as any).info
      if (isPlainObject(info)) return [...prev, info]
      if (includeNil === true && (info === undefined || info === null)) return [...prev, undefined]
      return prev
    }, [])
  }

  /**
   * Deserializes any value to a {@link SuperError} only if the value conforms
   * to a {@link SuperErrorObject}. If not, a {@link TypeError} is thrown. If
   * the value is already a {@link SuperError}, it is simply passed through.
   *
   * @param value - Any value.
   *
   * @returns The deserialized {@link SuperError} if applicable, or the original
   *          value if not applicable.
   *
   * @throws {TypeError} when unable to deserialize the value into a
   *         {@link SuperError}.
   */
  private static deserializeStrict(value: unknown): SuperError {
    if (typeIsSuperErrorObject(value)) {
      let cause: unknown = value.cause

      try {
        cause = this.deserializeStrict(value.cause)
      }
      catch (err) {}

      const newError = new SuperError(value.message, value.code, value.info, cause)
      newError.stack = value.stack
      return newError
    }

    throw TypeError(`Unable to deserialize value <${JSON.stringify(value)}> to SuperError`)
  }

  /**
   * Creates a copy of this {@link SuperError} instance and returns it.
   *
   * @returns The {@link SuperError} clone.
   */
  clone(): SuperError {
    const copy = new (this.constructor as new (message?: string) => SuperError)(this.message)
    return Object.assign(copy, this)
  }

  /**
   * @inheritdoc
   */
  toString(): string {
    return `${this.name}${this.code === undefined ? '' : `[${this.code}]`}: ${this.message}`
  }
}
