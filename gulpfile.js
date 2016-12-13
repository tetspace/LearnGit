var gulp=require('gulp'),
    sass=require('gulp-sass'),// 转译scss文件为css
    concat=require('gulp-concat'),// 将多个文件合并为一个文件
    sourcemaps=require('gulp-sourcemaps'),// 生成sourcemap方便调试
    filter=require('gulp-filter'),
    browserSync=require('browser-sync').create(),
    reload=browserSync.reload,
    imagemin=require('gulp-imagemin'),// 图片压缩
    notify=require('gulp-notify'),// 任务完成发出消息通知
    autoprefix=require('gulp-autoprefixer'),// 自动添加浏览器前缀
    fileInclude=require('gulp-file-include'),// html代码复用
    wrap=require('gulp-wrapper'),
    through=require('through2'),
    babel=require('gulp-babel'),
    uglify=require('gulp-uglify');

/*  sass编译后的css将注入到浏览器里实现更新
**  sass提供四个编译风格的选项：
        nested:             嵌套缩进的css代码，为默认值。
        expanded:           没有缩进的、扩展的css代码。
        compact:            简洁格式的css代码。
        compressed:         压缩后的css代码。

*/
gulp.task('sass', function () {
    return gulp.src(['./src/sass/all.scss'])
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compact'}).on('error', sass.logError))
        .pipe(autoprefix({
            cascade:true,
            remove:true
        }))
        .pipe(concat('main.css'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./src/css'))
        .pipe(filter('**/*.css'))
        .pipe(browserSync.stream());
});

// sass编译后的css将注入到浏览器里实现更新
gulp.task('css', function () {
    return gulp.src(['./src/css/**/*.css'])
        .pipe(gulp.dest('./dist/css'))
        .pipe(notify({message:'css:: <%= file.relative %> 任务完成!'}))
});

// html处理
gulp.task('html',function(){
    return gulp.src(['./src/*.html'])
        .pipe(gulp.dest('./dist'))
        .pipe(notify({message:'html:: <%= file.relative %> 任务完成!'}));
});

// gulp.task('fileInclude',function(){
//     gulp.src('./src/oms_index.html')
//         .pipe(fileInclude({prefix:'@@',basepath:'@file'}))
//         .pipe(gulp.dest('dist'));
// });

// gulp.task('wrap',function(){
//     gulp.src(['./src/*_content.html'])
//     .pipe(wrap({
//         header:'/* ./src/include/header.html */',
//         footer:'/* ./src/include/footer.html */'
//     }))
//     .pipe(gulp.dest('./dist'));
// })

// js处理
gulp.task('js',function(){
    return gulp.src(['./src/js/**/*.js'])
        .pipe(babel())
        .pipe(gulp.dest('./dist/js'))
        .pipe(notify({message:'js:: <%= file.relative %> 任务完成!'}));
});

gulp.task('uglifyjs',['js'],function(){
    return gulp.src(['./dist/js/**/*.js','!./dist/js/*.js'])
        .pipe(uglify({
            mangle:true,
            compress:true
        }))
        .pipe(gulp.dest('./dist/js'));
});

// 图片处理
gulp.task('img',function(){
    return gulp.src(['./src/**/*.{png,jpg,gif,eot,svg,ttf,woff,woff2}'])
        .pipe(imagemin())
        .pipe(gulp.dest('./dist'))

        .pipe(notify({message:'image:: <%= file.relative %> 任务完成!'}));
});


// 清空图片、样式、js
gulp.task('clean', function() {
    //buffer，類型Boolean，默認true，設置為false，將返回file.content的流並且不緩衝文件，處理大文件時非常有用
    //read為false，將不執行讀取文件操作，返回null;
    //base,類型String,設置輸出路徑以某個路徑的某個組成部分為基礎向後拼接
    return gulp.src(['./dist/**/*.{css,js,html,png,jpg,gif,eot,svg,ttf,woff,woff2}'], {read: false})
        .pipe(clean())
        .pipe(notify({message:'clean task complete!'}));
});

// 
gulp.task('bs',function(){
    browserSync.init({
        server:{
            baseDir:process.env.NODE_ENV === 'production' ? './dist' : './src'
        },
        browser:'chrome',
        port:80
    });
});

// 各种watch
gulp.task('watch',['bs'],function(){
    gulp.watch('./src/sass/**/*.scss',['sass']);
    gulp.watch('./src/*.html').on('change',reload);
    gulp.watch('./src/**/*.js').on('change',reload);
    gulp.watch('./src/**/*.{png,jpg,gif,eot,svg,ttf,woff,woff2}',reload);
});

// 生成版本号清单  

gulp.task('dev',['sass','watch']);
gulp.task('build',['html','css','uglifyjs','img','bs']);
