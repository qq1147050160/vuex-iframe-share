import { Plugin } from 'vuex'
import { event } from '@ice/stark-data'
import isEqual from 'lodash.isequal'

interface RuleOption {
  mode?: 'single' | 'share' // share 双向的(默认) single 单向的
  only?: string[] // 只接收指定的key
  mutationMethodName?: string // 触发vuex-persistedstate更新的方法名
}
interface StorageRuleOption extends RuleOption {
  storage?: Storage
}
interface ShareSendParams {
  mutation?: Record<string, any>
  state?: Record<string, any>
}

class VuexIframeShare {
  private static lastdata: any = {}

  private static option: StorageRuleOption = {}

  // 捡取数据
  private static pick(obj: Record<string, any> = {}, keys?: string[]) {
    // 不符合格式直接返回
    if (typeof obj !== 'object') return obj
    if (!keys || !obj) return obj
    if (Array.isArray(keys) && keys.length === 0) return obj

    // 如果传递, 则进行挑选
    return Object.keys(obj).reduce((o: Record<string, any>, key: string) => {
      if (keys.includes(key)) o[key] = obj[key]
      return o
    }, {})
  }

  // iframe 加载完毕，通知父框发送数据
  private static childLoaded() {
    if (window.parent === window) return
    window?.parent?.postMessage({ type: 'vuex-iframe-share-loaded' }, '*')
  }

  // 发送方法
  private static send(el: Window, option: ShareSendParams = {}) {
    el?.postMessage({ type: 'vuex-iframe-share', ...option }, '*')
  }

  // 接收方法
  private static receive({ data }) {
    const vm = (window as any).vm || (window as any).$vm
    const { type, ...args } = data || {}

    if (!type) return
    if (type === 'vuex-iframe-share') event.emit('VUE_IFRAME_SHARE_RECEIVE', { ...args })
    if (type === 'vuex-iframe-share-loaded') {
      const el = document.querySelector('iframe')?.contentWindow
      if (!Object.keys(this.lastdata).length) {
        this.lastdata.mutation = { type: 'vuex-iframe-share/loaded', payload: {} }
        this.lastdata.state = vm.$store.state
      }
      this.send(el, this.lastdata)
      vm.$store.state.vuex_iframe_share_loaded = true
    }
  }

  // main mount
  public static parant(option: RuleOption = {}): Plugin<any> {
    const { mode = 'share', only = [], mutationMethodName } = option
    window.removeEventListener('message', this.receive.bind(this))
    window.addEventListener('message', this.receive.bind(this))
    return store => {
      // 接收子发送的数据
      event.on('VUE_IFRAME_SHARE_RECEIVE', ({ mutation, state }) => {
        const data = this.pick(state, only)
        let isValueChange = false
        Object.keys(data).forEach((key: string) => {
          isValueChange = this.differValue(store.state[key], data[key])
          // 当值发生变化时，再触发更新
          if (isValueChange) {
            // 如果当前vuex 存在相同的模块
            if (store.state[key] && typeof store.state[key] === 'object') {
              Object.assign(store.state[key], {
                ...data[key]
              })
            } else {
              store.state[key] = data[key]
            }
          }
        })
        // 如果传入更新方法名字就执行更新
        if (mutationMethodName && isValueChange) {
          localStorage.VUE_IFRAME_SHARE_UPDATE = true
          store.commit(mutationMethodName, {})
        }
      })
      // 父向子发送数据
      store.subscribe((mutation, state) => {
        this.lastdata = { mutation, state }
        // eslint-disable-next-line no-void
        if (state === void 0 || localStorage.VUE_IFRAME_SHARE_UPDATE) {
          localStorage.VUE_IFRAME_SHARE_UPDATE = false
          return
        }
        if (mode === 'share') {
          const el = document.querySelector('iframe')?.contentWindow
          this.send(el, { mutation, state })
        }
      })
    }
  }

  // iframe
  public static child(option: RuleOption = {}): Plugin<any> {
    const { mode = 'share', only = [], mutationMethodName } = option
    window.removeEventListener('message', this.receive.bind(this))
    window.addEventListener('message', this.receive.bind(this))
    // 子组件加载完成，通知父组件
    window.removeEventListener('load', this.childLoaded.bind(this))
    window.addEventListener('load', this.childLoaded.bind(this))
    return store => {
      // 接收父发送的数据
      event.on('VUE_IFRAME_SHARE_RECEIVE', ({ mutation, state }) => {
        const data = this.pick(state, only)
        let isValueChange = false
        Object.keys(data).forEach((key: string) => {
          isValueChange = this.differValue(store.state[key], data[key])
          // 当值发生变化时，再触发更新
          if (isValueChange) {
            // 如果当前vuex 存在相同的模块
            if (store.state[key] && typeof store.state[key] === 'object') {
              Object.assign(store.state[key], {
                ...data[key]
              })
            } else {
              store.state[key] = data[key]
            }
          }
        })
        // 如果传入更新方法名字就执行更新
        if (mutationMethodName && isValueChange) {
          localStorage.VUE_IFRAME_SHARE_UPDATE = true
          store.commit(mutationMethodName, {})
        }
      })
      // 向父发送数据
      store.subscribe((mutation, state) => {
        this.lastdata = { mutation, state }
        // eslint-disable-next-line no-void
        if (state === void 0 || localStorage.VUE_IFRAME_SHARE_UPDATE) {
          localStorage.VUE_IFRAME_SHARE_UPDATE = false
          return
        }
        if (mode === 'share') {
          const el = window.parent
          // 避免非iframe中使用陷入死循环
          if (el !== window) {
            this.send(el, { mutation, state })
          }
        }
      })
    }
  }

  /**
   * iframe(非VueJS)
   */
  public static storage(option: StorageRuleOption = {}) {
    const { mode = 'share', only = [], storage = window.localStorage } = option
    // 保存下来get 和 set 使用
    this.option = { mode, only, storage }
    window.removeEventListener('message', this.receive.bind(this))
    window.addEventListener('message', this.receive.bind(this))
    // 子组件加载完成，通知父组件
    window.removeEventListener('load', this.childLoaded.bind(this))
    window.addEventListener('load', this.childLoaded.bind(this))
    // 接收父发送的数据
    event.on('VUE_IFRAME_SHARE_RECEIVE', ({ mutation, state }) => {
      const data = this.pick(state, only)
      this.setItem('vuex', data)
    })
    return {
      get: this.storageGet.bind(this),
      set: this.storageSet.bind(this)
    }
  }

  private static getItem(name: string): any {
    const { storage } = this.option
    let value = storage.getItem(name)
    try {
      value = JSON.parse(value)
    } catch (e) {
      value = null
    }
    return value
  }

  private static setItem(name: string, value: any): void {
    const { storage } = this.option
    try {
      value = JSON.stringify(value)
    } catch (e) {
      value = ''
    }
    storage.setItem(name, value)
  }

  private static storageGet(stateName: string = ''): any {
    const vuexData = this.getItem('vuex') || {}
    if (!stateName) return vuexData
    const [rootModule, stateKey] = stateName.split('/')
    // 如果stateKey存在说明是modeles
    if (stateKey) return vuexData?.[rootModule]?.[stateKey]
    return vuexData?.[rootModule]
  }

  private static storageSet(stateName: string = '', data: any) {
    if (!stateName) return
    const original = this.getItem('vuex') || {}
    const vuexData = this.getItem('vuex') || {}
    const [rootModule, stateKey] = stateName.split('/')
    // 如果stateKey存在说明是modeles
    if (stateKey) {
      if (vuexData[rootModule] === undefined) {
        vuexData[rootModule] = {}
      }
      vuexData[rootModule][stateKey] = data
      this.setItem('vuex', vuexData)
    } else {
      vuexData[rootModule] = data
      this.setItem('vuex', vuexData)
    }
    // 检查是否存在双向更新,如果是双向更新并且值发生改变就发送通知
    if (this.option.mode === 'share' && this.differValue(original, vuexData)) {
      const el = window.parent
      const mutation = { type: 'vuex-iframe-share/storage', payload: {} }
      const state = vuexData
      this.send(el, { mutation, state })
    }
    return vuexData
  }

  private static differValue(valueA: unknown, valueB: unknown): boolean {
    return !isEqual(valueA, valueB)
  }
}

export default VuexIframeShare
