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

- fix：Cancel 100ms delay transmission optimization, because delay may cause data not to be updated in time （v1.0.8）
- fix：`state.set('module/data', ...)`: Uncaught TypeError: Cannot read property 'module' of null（v1.0.7）
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
npm install --save vuex-iframe-share
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

  mutationMethodName?: string // It will only take effect if it is used in conjunction with 'vuex-persistedstate'
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
- Simply put, it is to synchronize and persist the data of vuex in `(local|session)Storage` or other storage methods so that it can be used again after refreshing
- The details are not explained here. You can go to check：[vuex-persistedstate](https://www.npmjs.com/package/vuex-persistedstate)

#### What are the current problems？

The data synchronized by `vuex-iframe-share` is only synchronized to memory, and no update is stored in storage，This is not bug，This is related to the update mechanism of `vuex-persistedstate`. We can do this to solve this problem

```typescript
// in `store.js`
import vuexIframeShare from "vuex-iframe-share";
 
const store = new Vuex.Store({
  mutations: {
    // Add refresh method here, recommended use Object.assign
    save(state, payload) {
      Object.assign(state, payload)
    }
    ...
  },
  plugins: [
    //In principle, let 'vuex iframe share' execute once store.commit ('save ', {}), execution will trigger the update!
    //Note: there is a value when executing 'Save': '{}' if you write like me above, you don't need to do any processing, otherwise you need to filter '{}'
    //Or write it in the module: 'modulename / save', of course, it doesn't make any difference, just to trigger the refresh
    vuexIframeShare.parant({ mutationMethodName: 'save' })
  ]
});

```

## 

If you find any problem, you can give me the issue feedback in GitHub. I will reply after receiving it. Thank you for using this plug-in


<!-- ## Thanks -->