

export class SimpleEvent<T extends string> {
  callbacks: {
    [propName: string]: any
  } = {}

  constructor() {

  }

  on(name: T, fn: Function) {
    if (this.callbacks[name]) {
      this.callbacks[name].push(fn)
    } else {
      this.callbacks[name] = [fn]
    }
  }

  emit(name: T, ...args) {
    const fns = this.callbacks[name]

    if (fns && fns.length) {
      fns.forEach(fn => fn.apply(this, args))
    }
  }

  off(name: T, fn: Function) {
    const fns = this.callbacks[name]

    if (fns && fns.length) {
      if (fn) {
        const newFns = fns.filter(item => item !== fn)

        if (newFns.length) {
          this.callbacks[name] = newFns
        } else {
          delete this.callbacks[name]
        }
      } else {
        delete this.callbacks[name]
      }
    }
  }
}