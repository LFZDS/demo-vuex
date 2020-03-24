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
