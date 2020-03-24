// Vuex中所有的状态更新的唯一途径都是mutation，
// 异步操作通过 Action 来提交 mutation实现，
// 这样使得我们可以方便地跟踪每一个状态的变化，从而让我们能够实现一些工具帮助我们更好地了解我们的应用。

// 每个mutation执行完成后都会对应到一个新的状态变更，
// 这样devtools就可以打个快照存下来，
// 然后就可以实现 time-travel 了。
// 如果mutation支持异步操作，
// 就没有办法知道状态是何时更新的，
// 无法很好的进行状态的追踪，给调试带来困难。

// 在 mutation 中混合异步调用会导致你的程序很难调试
// 现在想象，
// 我们正在 debug 一个 app 并且观察 devtool 中的 mutation 日志。
// 每一条 mutation 被记录，
// devtools 都需要捕捉到前一状态和后一状态的快照。
// 然而，在上面的例子中 mutation 中的异步函数中的回调让这不可能完成：
// 因为当 mutation 触发的时候，回调函数还没有被调用，
// devtools 不知道什么时候回调函数实际上被调用——实质上任何在回调函数中进行的状态的改变都是不可追踪的。


// 不过在mutation中用异步好像不会报错，会生效，看源码没有做拦截报错，应该只是一个规范吧（自己理解的）



// 注入
function install (Vue) {
    Vue.mixin({ beforeCreate: vuexInit });
}

function vuexInit () {
    var options = this.$options;  // new Vue({xxx}) $options{xxx} 一些配置
    // store injection
    if (options.store) {
        // 项目入口的时候 new Vue({xxx})
        this.$store = typeof options.store === 'function'
            ? options.store()
            : options.store;
    } else if (options.parent && options.parent.$store) {
        // 保证每个子组件都有一个共同的数据
        this.$store = options.parent.$store;
    }
}

// store
function Store(options) {
    var computed = {};
    this.getters = {};
    this.state = options.state;
    this.actions = options.actions;
    this.mutations = options.mutations;
    _.forEach(options.getters, function (fn, key) {
        computed[key] = function () { return fn(this.state); };
        Object.defineProperty(this.getters, key, {
            get: function () { return this._vm[key]; },
            enumerable: true // for local getters
        });
    });

    // 实现响应式，state数据一改，getter就会改，触发页面更新
    this._vm = new Vue({
        computed: computed
    });
}

// 快捷方法
var mapGetters = function (getters)
    // ...mapGetters([
    //     'crfDragStart',
    //     'crfDragType',
    //     'crfDragSectionStart',
    //     'crfRules'
    // ])
    var res = {};
    getters.forEach(function (ref) {
        var key = ref.key;
        var val = ref.val;

        res[key] = function mappedGetter () {
            return this.$store.getters[val]
        };
        // mark vuex getter for devtools
        res[key].vuex = true;
    });
    return res;
};


// 更改数据方法
Store.prototype.commit = function commit (_type, _payload, _options) {
    // this.$store.commit('aa', true);
    this.mutations[type](this.state);
};
Store.prototype.dispatch = function commit (_type, _payload, _options) {
    this.actions[type](this.commit, this.getters);
};

var index = {
    Store: Store,  // new vuex.Store();
    install: install,
    version: '3.1.0',
    mapGetters: mapGetters
};

module.exports = index;
