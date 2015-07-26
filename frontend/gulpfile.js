var gulp = require("gulp"),
    sourcemaps = require("gulp-sourcemaps"),
    babel = require("gulp-babel"),
    browserify = require("gulp-browserify"),
    buffer = require("vinyl-buffer"),
    map = require("map-stream"),
    uglify = require("gulp-uglify"),
    stringify = require("stringify"),
    postcss = require("gulp-postcss"),
    jshint = require("gulp-jshint"),
    stylish = require("jshint-stylish"),
    LessPluginCleanCSS = require("less-plugin-clean-css"),
    cleancss = new LessPluginCleanCSS({ advanced: true }),
    autoprefixer = require("autoprefixer-core"),
    less = require("gulp-less"),
    gutil = require("gulp-util"),
    concat = require("gulp-concat"),
    browserSync = require("browser-sync").create(),
    vendor = require("./vendorPaths.js");

gulp.task("vendor-js", function() {
  "use strict";
  gutil.log(gutil.colors.bgMagenta(":: BUILD VENDOR JS ::"));
  return gulp.src(vendor.js.standartPaths())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(concat("vendor.js"))
  .pipe(sourcemaps.write("."))
  .pipe(gulp.dest("dist/vendor"));
});

gulp.task("vendor-js:build", function() {
  "use strict";
  gutil.log(gutil.colors.bgMagenta(":: BUILD MINIFY VENDOR JS ::"));
  return gulp.src(vendor.js.minifyPaths())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(concat("vendor.min.js"))
  .pipe(sourcemaps.write("."))
  .pipe(gulp.dest("dist/vendor"));
});

gulp.task("vendor-css", function() {
  "use strict";
  gutil.log(gutil.colors.bgMagenta(":: BUILD VENDOR CSS ::"));
  return gulp.src(vendor.css.standartPaths())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(concat("vendor.css"))
  .pipe(sourcemaps.write("."))
  .pipe(gulp.dest("dist/vendor"));
});

gulp.task("vendor-css:build", function() {
  "use strict";
  gutil.log(gutil.colors.bgMagenta(":: BUILD MINIFY VENDOR CSS ::"));
  return gulp.src(vendor.css.minifyPaths())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(concat("vendor.min.css"))
  .pipe(sourcemaps.write("."))
  .pipe(gulp.dest("dist/vendor"));
});

var checkJsHint = map(function (file) {
    "use strict";
    if (!file.jshint.success) {
        gutil.log(gutil.colors.red("JSHint Failed " + file.path));
    }
});

var checkJsHintBuild = map(function (file) {
    "use strict";
    if (!file.jshint.success) {
        gutil.log(gutil.colors.red("JSHint Failed " + file.path));
        process.exit(1);
    }
});

gulp.task("js-hint", function () {
  "use strict";
  return gulp.src("app/**/*.js")
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(checkJsHint);
});

gulp.task("js-hint:build", function () {
  "use strict";
  return gulp.src("app/**/*.js")
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(checkJsHintBuild);
});

gulp.task("babelify", ["vendor-js"], function() {
  "use strict";
  return gulp.src("app/**/*.js")
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(babel({
    blacklist: ["strict"]
  }))
  .pipe(concat("production.js"))
  .pipe(browserify({
    transform: stringify({
      extensions: [".tpl"], minify: true
    })
  }))
  .pipe(buffer())
  .pipe(sourcemaps.write("."))
  .pipe(gulp.dest("dist/src"))
  .pipe(browserSync.stream());
});

gulp.task("babelify:build", ["vendor-js:build"], function() {
  "use strict";
  gutil.log(gutil.colors.bgYellow(":: BUILD JS ::"));
  return gulp.src("app/**/*.js")
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(babel({
    blacklist: ["strict"]
  }))
  .pipe(concat("production.min.js"))
  .pipe(browserify({
    transform: stringify({
      extensions: [".tpl"], minify: true
    })
  }))
  .pipe(buffer())
  .pipe(uglify())
  .pipe(sourcemaps.write("."))
  .pipe(gulp.dest("dist/build/src"));
});

gulp.task("less", ["vendor-css"], function () {
  "use strict";
  return gulp.src("app/styles/**/*.less")
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(concat("production.css"))
    .pipe(postcss([ autoprefixer({ browsers: ["last 2 versions"] }) ]))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist/styles"))
    .pipe(browserSync.stream());
});

gulp.task("less:build", ["vendor-css:build"], function () {
  "use strict";
  gutil.log(gutil.colors.bgBlue(":: BUILD LESS ::"));
  return gulp.src("app/styles/**/*.less")
    .pipe(sourcemaps.init())
    .pipe(less({
      plugins: [cleancss]
    }))
    .pipe(concat("production.min.css"))
    .pipe(postcss([ autoprefixer({ browsers: ["last 2 versions"] }) ]))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist/build/styles"));
});

gulp.task("browser-sync", function() {
  "use strict";
   browserSync.init({
     server: {
       baseDir: "./",
       index: "app/index.html"
     }
   });

   gulp.watch("app/**/*.js", function(e) {
     gutil.log(gutil.colors.bgYellow("JS"), ":: File changed ", gutil.colors.yellow(e.path));
     gulp.start("js-hint");
     gulp.start("babelify");
   });

   gulp.watch("app/styles/**/*.less", function(e) {
     gutil.log(gutil.colors.bgBlue("LESS"), ":: File changed ", gutil.colors.blue(e.path));
     gulp.start("less");
   });

   gulp.watch("app/src/templates/*.tpl", function(e) {
     gutil.log(gutil.colors.bgGreen("TPL"), ":: File changed ", gutil.colors.green(e.path));
     gulp.start("babelify");
   });

   gulp.watch("app/*.html").on("change", browserSync.reload);
});

gulp.task("serve", ["browser-sync", "js-hint", "babelify", "less"]);
gulp.task("build", ["js-hint:build", "babelify:build", "less:build"]);
