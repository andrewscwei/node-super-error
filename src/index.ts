export class SuperError extends Error {
  readonly code?: string
  readonly info?: { [key: string]: any }

  constructor(message?: string, code?: string, info?: { [key: string]: any }) {
    super(message)
    this.name = 'SuperError'
    this.code = code
    this.info = info
  }
}
