wMessenger 跨窗口消息广播与监听
====

## 概述

wMessenger是基于Web Storage实现的跨窗口消息广播与监听的一套解决方案。通过wMessenger，可以方便监听同域下其他窗口或frame广播的通知，并支持从通知中获取携带的数据(数字、字符串、复杂的JSON格式数据等)。

## 快速上手

获得 wMessenger 后，你只需要引入一个文件：

```
../dist/wMessenger.min.js
```

wMessenger 兼容AMD规范，也可以使用RequireJS进行加载：

```
require(['../dist/wMessenger.min'], function(wm){
    console.log(wm);
});
```

## 注册监听
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body>
<script src="../dist/wMessenger.min.js" type="text/javascript"></script>
<script>
    // 监听key为test1的广播，并执行cb回调，打印出广播数据
    var guid1 = wMessenger.addListener({
        key: "test1",
        cb: function(data){
            console.log(data);
        }
    });
    
    // 监听key为test2的广播，并且只有当广播携带数据为数组[1,2,3]时，才执行cb回调
    var guid2 = wMessenger.addListener({
        key: "test2",
        data: [1,2,3],
        cb: function(data){
            console.log(data);
        }
    });
    
    // 监听key为test3的广播，并且只有当广播携带数据为对象{a:1, b:2}时，才执行cb回调
    var guid3 = wMessenger.addListener({
        key: "test3",
        data: {a:1, b:2},
        cb: function(data){
            console.log(data);
        }
    });
    
    // 监听key为test4的广播，并且只有当广播携带数据为数字123时，才执行cb回调
    var guid4 = wMessenger.addListener({
        key: "test4",
        data: 123,
        cb: function(data){
            console.log(data);
        }
    });
    
    // 同时监听key为test5和test6的广播，并执行cb回调
    var guid56 = wMessenger.addListener({
        key: ["test5", "test6"],
        cb: function(data){
            console.log(data);
        }
    });
</script> 
</body>
</html>
```
