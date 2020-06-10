import { Plugin } from 'vuex'
import { event } from '@ice/stark-data'

interface RuleOption {
  mode?: 'single' | 'share' // share 双向的(默认) single 单向的
  only?: string[] // 只接收指定的key
}
interface ShareSendParams {
  mutation?: Record<string, any>
  state?: Record<string, any>
}

class VuexIframeShare {
  private static timer: any = null

  private static lastdata: any = {}

  // 捡取数据
  private static pick(obj: Record<string, any> = {}, keys?: string[]) {
    // 如果keys没值，直接返回
    if (Array.isArray(keys) && keys.length === 0) return obj
    if (!keys) return obj
    if (typeof obj !== 'object' || obj === null) return {}

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
          if (store.state[key]) {
            Object.assign(store.state[key], {
              ...this.pick(data[key], only)
            })
          } else {
            store.state[key] = { ...this.pick(data[key], only) }
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
      // 接收子发送的数据
      event.on('VUE_IFRAME_SHARE_RECEIVE', ({ mutation, state }) => {
        const data = this.pick(state, only)
        Object.keys(data).forEach((key: string) => {
          // 如果当前vuex 存在相同的模块
          if (store.state[key]) {
            Object.assign(store.state[key], {
              ...this.pick(data[key], only)
            })
          } else {
            store.state[key] = { ...this.pick(data[key], only) }
          }
        })
      })
      // 父向子发送数据
      store.subscribe((mutation, state) => {
        if (mode === 'share') {
          const el = window.parent
          this.send(el, { mutation, state })
        }
      })
    }
  }
}

export default VuexIframeShare
