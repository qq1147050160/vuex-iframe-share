# 🔔 Updated

- perf：`store.state` updateValue === originalValue situation, The `set` function will no longer be triggered to prevent abuse of the `watch`（v1.0.10）
- fix：added `window.parant` check to prevent use in non iframes, which may lead to deadlock (v1.0.10)
- fix：optimized refresh method execution does not pass notifications to iframe （v1.0.9）
- fix：Cancel 100ms delay transmission optimization, because delay may cause data not to be updated in time （v1.0.8）
- fix：`state.set('module/data', ...)`: Uncaught TypeError: Cannot read property 'module' of null（v1.0.7）
- feat：working with `vuex-persistedstate`, new option `mutationMethodName`（v1.0.6）
- fix：`vuexIframeShare.storage` function error reporting for null（v1.0.5）
- init and fix problem (v1.0.0 -- v1.0.4)
