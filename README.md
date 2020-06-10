# vuex-iframe-share
This is a package for data synchronization of vuex data in iframe in the vuejs project


## Introduce
---
Engineers who use vuejs should know what vuex is! It is an essential tool in actual development. But when we use vuejs + iframe to develop applications, we will find that data communication is a headache. You need to use `postMessage` every time. To solve this problem, `vuex-iframe-share` is born. Let the vuex in the current day's Vue and the vuex in iframe share data. If your iframe doesn't use vuejs, it doesn't matter, `vuex-iframe-share` will store the data in the` window.localStorage `In.

## Characteristic
---
- Automated
- Real time change
- The bag is very small

## Installation
---
> yarn add vuex-iframe-share
> or
> npm install vuex-iframe-share

## Params
---
> vuexIframeShare.parant(option)
> vuexIframeShare.child(option)

```
option: {
  // share # mutual transmission(default)
  // single # receive only and not send
  mode?: 'single' | 'share'
  only?: string[] // receive only the specified keys
}
```

## Usage
---

> `In VueJS`
```
import vuexIframeShare from "vuex-iframe-share";
 
const store = new Vuex.Store({
  state: {
    ...
  },
  plugins: [vuexIframeShare.parant()]
});
```

> `In IFrame（vuejs）`
```
import vuexIframeShare from "vuex-iframe-share";
 
const store = new Vuex.Store({
  state: {
    ...
  },
  plugins: [vuexIframeShare.child()]
});
```

### Note：not currently available
> `In IFrame（not vuejs）`
```
import vuexIframeShare from "vuex-iframe-share";
 
// Mount
const state = vuexIframeShare.storage();

// Getter
state.get('data')

// Setter
state.set('data', here is to save the data)

```