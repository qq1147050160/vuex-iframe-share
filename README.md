<h1 align="center">
  vuex-iframe-share
</h1>
This is a package for data synchronization of vuex data in iframe in the vuejs project

<p align="right" style="position:absolute;top:16px;right:28px;">
  English | <a href="https://github.com/qq1147050160/vuex-iframe-share/blob/master/README.zh-CN.md">中文</a>
</p>


## Introduce

Engineers who use vuejs should know what vuex is! It is an essential tool in actual development. But when we use vuejs + iframe to develop applications, we will find that data communication is a headache. You need to use `postMessage` every time. To solve this problem, `vuex-iframe-share` is born. Let the vuex in the current day's Vue and the vuex in iframe share data. If your iframe doesn't use vuejs, it doesn't matter, `vuex-iframe-share` will store the data in the `window.(local|session)Storage` In.

## ✨ Characteristic

- Automated
- Real time change
- Customizable

## 🔔 Updated

- feat：working with `vuex-persistedstate`, new option `mutationMethodName`（v1.0.6）
- fix：`vuexIframeShare.storage` error reporting for null（v1.0.5）
- <a href="https://github.com/qq1147050160/vuex-iframe-share/blob/master/UPDATED.md">Intact Updated Docs</a>

## 🔧 Requirements

- [Vue.js](https://vuejs.org) (v2.0.0+)
- [Vuex](http://vuex.vuejs.org) (v2.0.0+)

#### What is worth understanding is the principle of using` window.postMessage `, it has some limitations to note. For example, the transmission size and so on. There are references below
- [MDN window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

## 🔧  Installation

### CDN

```bash
<script src="https://cdn.jsdelivr.net/npm/vuex-iframe-share/dist/vuex-iframe-share.umd.min.js"></script>
```

### NPM

```bash
npm install vuex-iframe-share
```

### YARN

```bash
yarn add vuex-iframe-share
```

## 📦 Method

```typescript
vuexIframeShare.parant(option)
vuexIframeShare.child(option)
vuexIframeShare.storage(option)
```

## Params

```typescript
option: {
  // share # mutual transmission (default)
  // single # receive only and not send
  mode?: 'single' | 'share'
  only?: string[] // receive only the specified keys,It also includes the modules name, because the modules name is also stored in the state

  // This parameter is only available in vuexIframeShare.storage Valid in.
  // In vuejs, please use such as: `vuex-persistedstate ...` package
  storage?: Storage // sessionStorage | localStorage (default)
}
```

## Usage

#### In VueJS

```typescript
import vuexIframeShare from "vuex-iframe-share";
 
const store = new Vuex.Store({
  state: {
    ...
  },
  plugins: [vuexIframeShare.parant()]
});
```

#### In IFrame（vuejs）

```typescript
import vuexIframeShare from "vuex-iframe-share";
 
const store = new Vuex.Store({
  state: {
    ...
  },
  plugins: [vuexIframeShare.child()]
});
```

#### In IFrame（not vuejs）

```typescript
import vuexIframeShare from "vuex-iframe-share";
 
// Mount
const state = vuexIframeShare.storage();

// Getter or Modules Getter
const vuexData = state.get()
const data = state.get('data')
const moduleData = state.get('moduleName/data')

// Setter or Modules Setter
state.set('data', here is to save the data)
state.set('moduleName/data', here is to save the data)

// It is worth mentioning that after setter, there are the latest vuex results, so we can do this:
const vuexData = state.set('data', here is to save the data)

// You can also use structure assignment
const { ... } = state.set('data', here is to save the data)
```

## Working with vuex-persistedstate

<b>What is `vuex-persistedstate` ？</b>
- 简单来说就是让vuex 的数据，同步并且持久化保存在 (local|session)Storage 中或其他存储方式，以便刷新后还能继续使用
- 具体不在这里详细说明，可以到 查看：[vuex-persistedstate](https://www.npmjs.com/package/vuex-persistedstate)

#### 目前存在什么问题？

`vuex-iframe-share` 同步的数据只同步到了实时内存中，并没有更新储存到 Storage 中，这不是BUG，这与 `vuex-persistedstate` 插件的更新机制有关。我们可以这样做，来解决这个问题：

```typescript
// in `store.js`
import vuexIframeShare from "vuex-iframe-share";
 
const store = new Vuex.Store({
  state: {
    ...
  },
  mutations: {
    // Add refresh method here, recommended use Object.assign
    save(state, payload) {
      Object.assign(state, payload)
    },
    ...
  },
  plugins: [
    // Essentially, let `vuex-iframe-share` once store.commit('save', {}) This triggers the update。
    // note: When mutationMethodName is executed, an empty object “{}” is passed in。
    // If follow the above practice, don't need to do anything, otherwise need to pay attention
    vuexIframeShare.parant({ mutationMethodName: 'save' }) // mutations -> save (name)

    // Or use the module mode. Of course, it doesn't make any difference. It's just to trigger the refresh. That's all
    vuexIframeShare.parant({ mutationMethodName: 'moduleName/save' })
  ]
});

```

## 

If you find any problem, you can give me the issue feedback in GitHub. I will reply after receiving it. Thank you for using this plug-in


<!-- ## Thanks -->