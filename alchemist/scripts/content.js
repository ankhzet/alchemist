webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

  "use strict";
  const parcel_1 = __webpack_require__(34);
  const actions_1 = __webpack_require__(44);
  const execute_1 = __webpack_require__(45);
  class ConnectorChannel extends parcel_1.ClientPort {
      constructor() {
          super('gearbox');
          this.on(execute_1.ExecuteAction, this.executed.bind(this));
          if (!this.rebind()) {
              throw new Error('Failed to connect to background script');
          }
      }
      notifyDisconnect() {
          if (!this.port)
              return;
          // Actions.postpone(this, 'clear');
      }
      executed(sender, { plugin, code }, packet) {
          // console.log('executing', plugin, code, packet);
          let handler = eval(`(context, args) => (${code}).apply(context, args)`);
          return handler(plugin, [{
                  dom: document,
                  fire: (event, ...args) => actions_1.GearBoxActions.fire(this, { sender: plugin.uid, event: event }),
                  unmount: () => actions_1.GearBoxActions.unmount(this, { uid: plugin.uid }),
              }]);
      }
  }
  ((channel, interval) => {
      console.log('Injecting GearBox...');
      window.onbeforeunload = function (e) {
          return channel.notifyDisconnect();
      };
      let timer;
      let checker = () => {
          let prev = channel.touched;
          let delta = (+new Date) - prev;
          if ((delta > interval) || !prev) {
              if (prev)
                  console.log(`Last request ${delta} msec ago (${interval} delay for reconnect)`);
              if (!channel.rebind()) {
                  console.log('Failed to connect to extension, reloading');
                  window.location.reload();
              }
          }
          if (interval && !timer)
              timer = window.setInterval(checker, interval / 10);
      };
      if (document.readyState === 'complete') {
          checker();
      }
      else
          window.onload = () => {
              checker();
          };
  })(new ConnectorChannel(), 0); // 60 * 1000);
  //# sourceMappingURL=content.js.map

/***/ }
]);