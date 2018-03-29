/*!
 * wMessenger：基于Web Storage的跨窗口消息广播与监听
 * @author Kyle Huang
 */
;(function (global, factory) {

    if(typeof define === 'function' && define.amd){
        define(factory);
    }else{
        global.wMessenger = factory();
    }

}(this, function () { 'use strict'; 

    var handlers = [],
        prefix = 'wMessenger-',
        getGuid = function(){ return +new Date() };

    /*
     * 新增一个监听事件
     * 
     *  @options: {
     *      key:   要监听的键名，单个'data01'或多个['data01','data02']
     *      data:  可选参数，当新增或更新某个存储项之后，并且其新值等于此参数时，触发回调函数。如果不传入该参数，则新增/更新/删除存储项都执行回调函数。
     *      type:  可选参数，可取3个值，'add','update','delete'。如果不传入该参数，则新增/更新/删除存储项都执行回调函数。
     *      cb:    回调函数，当监控项发生变化时执行
     *  }
     */
    function addListener(options) {

        var options = options || {}, mapArr = [];

        // 未传入某些参数则退出
        if (Object.prototype.toString.call(options.cb) !== '[object Function]') {
            throw new Error('wMessenger Error: cb值必须为函数');
            return;
        }

        // 将传入的参数options.key保存到mapArr备用
        if (Object.prototype.toString.call(options.key) === '[object String]') {

            mapArr.push(prefix + options.key);

        } else if(Array.isArray(options.key)){

            mapArr = options.key.map(function(item){
                return prefix + item;
            });

        }else{
            throw new Error('wMessenger Error: 监听的key值必须为字符串或字符串数组');
        }

        var fn = function (e) {

            // storage变化类型
            var type;

            // 判断发生变化的键名是否是参数所指定的键名
            if (mapArr.indexOf(e.key) === -1) {
                return;
            }

            // 判断type的类型：新增、更新或删除
            if (e.oldValue === null) {
                type = 'add';
            } else if (e.newValue === null) {
                type = 'delete';
            } else {
                type = 'update';
            }

            // 检测type值是否匹配
            if (options.type && options.type !== type) {
                return;
            }

            // 解析storage的新值
            var jsonValue = JSON.parse(e.newValue), 
                userData;

            if(jsonValue){
                // jsonValue.data里存储了用户通过broadcast广播的数据
                // 当用户自定义数据符合JSON字符串格式时，解析成JSON对象
                // 否则当做基础数据类型处理
                if(/^\{.*\}$/.test(jsonValue.data) || /^\[.*\]$/.test(jsonValue.data)){
                    userData = JSON.parse(jsonValue.data);
                }else{
                    userData = jsonValue.data;
                }
            }
            
            // 检测监听的data值是否匹配
            if (typeof options.data !== 'undefined' && options.data !== null) {

                // 如果data值为对象类型，则序列化成JSON格式字符串
                // 否则当做基础数据类型处理
                if(Array.isArray(options.data) || Object.prototype.toString.call(options.data) === '[object Object]'){
                    if(JSON.stringify(options.data) !== jsonValue.data){
                        return;
                    }
                }else{
                    if(options.data !== jsonValue.data){
                        return;
                    }
                }
            }

            // 执行回调函数，并将用户广播的数据传递回去
            options.cb(userData);
        };

        var newguid = getGuid();

        // 保存事件处理函数
        handlers[newguid] = fn;

        // 绑定storage监听事件
        window.addEventListener('storage', fn, true);

        return newguid;
    }

    /*
     * 根据guid移除指定的信息监听函数
     * @guid: 此参数是使用addListener方法添加监听之后获取的返回值。取消监听需传入此参数。
     */
    function removeListener(guid) {
        handlers[guid] && window.removeEventListener('storage', handlers[guid], true);
        handlers[guid] = null;
    }

    /*
     * 广播消息
     * 
     * @options: {
     *     key:   要触发监听事件的键名
     *     data:  可选参数，当传入此参数，则设置指定键名的值为value，否则设置成随机数字。注意：当两次传入的value值相同时，第二次将无法触发监听事件
     * }
     */
    function broadcast(options) {

        var options = options || {};

        // 未传入key参数则退出
        if (!options.key || Object.prototype.toString.call(options.key) !== '[object String]') {
            throw new Error('wMessenger Error: 广播的key值必须为字符串');
        }

        // 构造广播数据
        var broadcastData = {};

        // 当Web Storage存储的数据未发生变化时，不会触发storage事件
        // 所以此处使用随机时间戳，确保每次广播的数据都不一样
        broadcastData['t'] = (new Date()).getTime() + '' + Math.floor(Math.random() * 1000);

        // 如果用户传入了自定义数据，则添加到广播数据中
        // 当自定义数据为对象类型时，则序列化成JSON字符串
        // 否则当做基础数据类型处理
        if(typeof options.data !== 'undefined' && options.data !== null){
            if(Array.isArray(options.data) || Object.prototype.toString.call(options.data) === '[object Object]'){
                broadcastData['data'] = JSON.stringify(options.data);
            }else{
                broadcastData['data'] = options.data;
            }
        }
        
        // 设置新值
        // 由于sessionStorage只能在同个页面的框架页内部触发storage事件
        // 因此此处使用localStorage以实现跨窗口
        window.localStorage.setItem(prefix + options.key, JSON.stringify(broadcastData));
    }

    return {
        addListener: addListener,
        removeListener: removeListener,
        broadcast: broadcast
    };
}));