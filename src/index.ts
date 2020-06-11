import { Plugin } from 'vuex'
import { event } from '@ice/stark-data'

interface RuleOption {
  mode?: 'single' | 'share' // share 双向的(默认) single 单向的
  only?: string[] // 只接收指定的key
}
interface StorageRuleOption extends RuleOption {
  storage?: Storage
}
interface ShareSendParams {
  mutation?: Record<string, any>
  state?: Record<string, any>
}

class VuexIframeShare {
  private static timer: any = null

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
    window?.parent?.postMessage({ type: 'vuex-iframe-share-loaded' }, '*')
  }

  // 发送方法
  private static send(el: Window, option: ShareSendParams = {}) {
    clearTimeout(this.timer)
    // 因为每次都是发送全量数据，所以优化下发送次数
    this.timer = setTimeout(() => {
      el?.postMessage({ type: 'vuex-iframe-share', ...option }, '*')
    }, 100)
  }

  // 接收方法
  private static receive({ data }) {
    const { type, ...args } = data || {}
    const vm: any = (window as any).vm || (window as any).$vm
    if (!type) return
    if (type === 'vuex-iframe-share') event.emit('VUE_IFRAME_SHARE_RECEIVE', { ...args })
    if (type === 'vuex-iframe-share-loaded') {
      const el = document.querySelector('iframe')?.contentWindow
      if (!Object.keys(this.lastdata).length) {
        this.lastdata.mutation = { type: 'vuex-iframe-share/loaded', payload: {} }
        this.lastdata.state = vm.$store.state
      }
      this.send(el, this.lastdata)
      // eslint-disable-next-line no-underscore-dangle
      vm.$store.state._vuexIframeShareLoaded = true
    }
  }

  /**
   * 项目中
   * @param mode share 双向的(默认) single 单向的
   * @param only 只接收指定的key
   */
  public static parant(option: RuleOption = {}): Plugin<any> {
    const { mode = 'share', only = [] } = option
    window.removeEventListener('message', this.receive.bind(this))
    window.addEventListener('message', this.receive.bind(this))
    return store => {
      // 接收子发送的数据
      event.on('VUE_IFRAME_SHARE_RECEIVE', ({ mutation, state }) => {
        const data = this.pick(state, only)
        Object.keys(data).forEach((key: string) => {
          // 如果当前vuex 存在相同的模块
          if (store.state[key] && typeof store.state[key] === 'object') {
            Object.assign(store.state[key], {
              ...data[key]
            })
          } else {
            store.state[key] = data[key]
          }
        })
      })
      // 父向子发送数据
      store.subscribe((mutation, state) => {
        this.lastdata = { mutation, state }
        if (mode === 'share') {
          const el = document.querySelector('iframe')?.contentWindow
          this.send(el, { mutation, state })
        }
      })
    }
  }

  /**
   * iframe中
   * @param mode share 双向的(默认) single 单向的
   * @param only 只接收指定的key
   */
  public static child(option: RuleOption = {}): Plugin<any> {
    const { mode = 'share', only = [] } = option
    window.removeEventListener('message', this.receive.bind(this))
    window.addEventListener('message', this.receive.bind(this))
    // 子组件加载完成，通知父组件
    window.removeEventListener('load', this.childLoaded.bind(this))
    window.addEventListener('load', this.childLoaded.bind(this))
    return store => {
      // 接收父发送的数据
      event.on('VUE_IFRAME_SHARE_RECEIVE', ({ mutation, state }) => {
        const data = this.pick(state, only)
        Object.keys(data).forEach((key: string) => {
          // 如果当前vuex 存在相同的模块
          if (store.state[key] && typeof store.state[key] === 'object') {
            Object.assign(store.state[key], {
              ...data[key]
            })
          } else {
            store.state[key] = data[key]
          }
        })
      })
      // 向父发送数据
      store.subscribe((mutation, state) => {
        if (mode === 'share') {
          const el = window.parent
          this.send(el, { mutation, state })
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
      this.set('vuex', data)
    })
    return {
      get: this.storageGet.bind(this),
      set: this.storageSet.bind(this)
    }
  }

  // storage.getItem
  private static get(name: string): any {
    const _storage = this.option.storage
    let value = _storage.getItem(name)
    try {
      value = JSON.parse(value)
    } catch (e) {
      value = null
    }
    return value
  }

  // storage.setItem
  private static set(name: string, value: any): void {
    const _storage = this.option.storage
    try {
      value = JSON.stringify(value)
    } catch (e) {
      value = ''
    }
    _storage.setItem(name, value)
  }

  private static storageGet(stateName: string = ''): any {
    const vuexData = this.get('vuex')
    if (!stateName) return vuexData
    const [rootModule, stateKey] = stateName.split('/')
    // 如果stateKey存在说明是modeles
    if (stateKey) return vuexData?.[rootModule]?.[stateKey]
    return vuexData?.[rootModule]
  }

  private static storageSet(stateName: string = '', data: any) {
    if (!stateName) return
    const vuexData = this.get('vuex')
    const [rootModule, stateKey] = stateName.split('/')
    // 如果stateKey存在说明是modeles
    if (stateKey && vuexData?.[rootModule]) {
      vuexData[rootModule][stateKey] = data
      this.set('vuex', vuexData)
    } else {
      vuexData[rootModule] = data
      this.set('vuex', vuexData)
    }
    // 检查是否存在双向更新
    if (this.option.mode === 'share') {
      const el = window.parent
      const mutation = { type: 'vuex-iframe-share/storage', payload: {} }
      const state = vuexData
      this.send(el, { mutation, state })
    }
    return vuexData || {}
  }
}

export default VuexIframeShare
