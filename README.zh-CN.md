<h1 align="center">
  vuex-iframe-share
</h1>
这是vuejs项目中，让iframe中的数据自动同步包

<p align="right" style="position:absolute;top:16px;right:28px;">
  <a href="https://github.com/qq1147050160/vuex-iframe-share/blob/master/README.md">English</a> | 中文
</p>

## 介绍

使用vuejs的工程师应该知道vuex是什么！它是实际开发中必不可少的工具。但是当我们使用vuejs+iframe开发应用程序时，我们会发现数据通信是一个令人头疼的问题。你每次都要用`postMessage`发送数据。为了解决这个问题，`vuex-iframe-share`诞生了。让当前的vuex和iframe中的vuex共享数据。如果iframe不使用vuejs，那没关系，`vuex-iframe-share` 将数据存储在` window.(local|session)Storage` 中。


## ✨ 特性

- 自动化
- 实时变化
- 可定制

## 🔧 要求

- [Vue.js](https://vuejs.org) (v2.0.0+)
- [Vuex](http://vuex.vuejs.org) (v2.0.0+)

#### 值得注意的是 在原理上使用的是 `window.postMessage`,它有一些限制需要注意。比如传输大小等等..,下方有查考资料
- [MDN window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

## 🔧  安装

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

## 📦 方法

```typescript
vuexIframeShare.parant(option)
vuexIframeShare.child(option)
vuexIframeShare.storage(option)
```

## 参数说明

```typescript
option: {
  // share # 相互传输（默认）
  // single # 只接收不发送
  mode?: 'single' | 'share'
  only?: string[] // 只接收指定的keys，模块名也算在内，因为模块名也是存储在 state 中的。

  // 此参数仅在vuexIframeShare.storage在中有效。
  // 在vuejs中，请使用如下代码包：`vuex-persistedstate…` 代替
  storage?: Storage // sessionStorage | localStorage (默认)
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

// 值得一提的是，在setter之后，有最新的vuex结果，因此我们可以这样做：
const vuexData = state.set('data', here is to save the data)

// 也可以使用结构赋值
const { ... } = state.set('data', here is to save the data)
```

## 

如果您发现任何问题，可以在GitHub中给我问题反馈。收到后我会回复的。感谢您使用此插件


<!-- ## Thanks -->