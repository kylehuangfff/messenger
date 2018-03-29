
'use strict';

const debug = true;

let gulp = require('gulp');

let jsmin = require('gulp-uglify');
let pump = require('pump');
let rename = require('gulp-rename');


// 路径配置
let paths = {

    js: {
        src: ['./src/*.js'],
        dest: './dist'
    }
};

// 入口程序
gulp.task('default', ()=>{
    gulp.watch(paths.js.src, ['jsmin']);
});

// js压缩
gulp.task('jsmin', (callback)=> {
    pump([
        gulp.src(paths.js.src),
        jsmin(),
        rename({suffix: '.min'}),
        gulp.dest(paths.js.dest)
    ], callback);
});