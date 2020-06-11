# vuex-iframe-share
This is a package for data synchronization of vuex data in iframe in the vuejs project


## Introduce
Engineers who use vuejs should know what vuex is! It is an essential tool in actual development. But when we use vuejs + iframe to develop applications, we will find that data communication is a headache. You need to use `postMessage` every time. To solve this problem, `vuex-iframe-share` is born. Let the vuex in the current day's Vue and the vuex in iframe share data. If your iframe doesn't use vuejs, it doesn't matter, `vuex-iframe-share` will store the data in the` window.localStorage `In.

## Characteristic
- Automated
- Real time change
- The bag is very small

## Installation
```
// Run
yarn add vuex-iframe-share
npm install vuex-iframe-share
```

## Params
```
vuexIframeShare.parant(option)
vuexIframeShare.child(option)
vuexIframeShare.storage(option)
```

```typescript
option: {
  // share # mutual transmission (default)
  // single # receive only and not send
  mode?: 'single' | 'share'
  only?: string[] // receive only the specified keys,It also includes the modules name, because the modules name is also stored in the state

  // This parameter is only available in vuexIframeShare.storage Valid in. In vuejs, please use such as: `vuex-persistedstate ...` package
  storage?: Storage // sessionStorage | localStorage (default)
}
```

## Usage

> In VueJS

```typescript
import vuexIframeShare from "vuex-iframe-share";
 
const store = new Vuex.Store({
  state: {
    ...
  },
  plugins: [vuexIframeShare.parant()]
});
```

> In IFrame（vuejs）

```typescript
import vuexIframeShare from "vuex-iframe-share";
 
const store = new Vuex.Store({
  state: {
    ...
  },
  plugins: [vuexIframeShare.child()]
});
```

> In IFrame（not vuejs）

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

## 

If you find any problem, you can give me the issue feedback in GitHub. I will reply after receiving it. Thank you for using this plug-in


<!-- ## Thanks -->