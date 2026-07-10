/**
 * pdfjs-dist 5.4+ / 6.x 会调用较新的 JS API。
 * 很多手机浏览器还没有，会导致「a.toHex is not a function」。
 */
export function installPdfCompat(): void {
  const u8 = Uint8Array.prototype as Uint8Array & {
    toHex?: () => string
  }
  if (typeof u8.toHex !== 'function') {
    Object.defineProperty(Uint8Array.prototype, 'toHex', {
      value(this: Uint8Array) {
        let hex = ''
        for (let i = 0; i < this.length; i++) {
          hex += this[i]!.toString(16).padStart(2, '0')
        }
        return hex
      },
      writable: true,
      configurable: true,
    })
  }

  const mapProto = Map.prototype as Map<unknown, unknown> & {
    getOrInsertComputed?: (key: unknown, cb: (key: unknown) => unknown) => unknown
  }
  if (typeof mapProto.getOrInsertComputed !== 'function') {
    Object.defineProperty(Map.prototype, 'getOrInsertComputed', {
      value(this: Map<unknown, unknown>, key: unknown, callbackFn: (key: unknown) => unknown) {
        if (this.has(key)) return this.get(key)
        const value = callbackFn(key)
        this.set(key, value)
        return value
      },
      writable: true,
      configurable: true,
    })
  }

  const PromiseAny = Promise as unknown as {
    withResolvers?: <T>() => {
      promise: Promise<T>
      resolve: (value: T | PromiseLike<T>) => void
      reject: (reason?: unknown) => void
    }
  }
  if (typeof PromiseAny.withResolvers !== 'function') {
    PromiseAny.withResolvers = function withResolvers<T>() {
      let resolve!: (value: T | PromiseLike<T>) => void
      let reject!: (reason?: unknown) => void
      const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
      })
      return { promise, resolve, reject }
    }
  }
}
