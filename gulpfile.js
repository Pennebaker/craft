// jshint esversion: 6
// jshint node: true
"use strict";

const crypto = require('crypto');

// package vars
const pkg = require("./package.json");

// gulp
const gulp = require('gulp');
const through = require('through2');

// load all plugins in "devDependencies" into the variable $
const $ = require('gulp-load-plugins')({
    pattern: ['*'],
    scope: ['devDependencies']
});

// error logging
const onError = err => {
    console.log(err);
};

let hashString = str => {
  let hash = crypto.createHash('sha256')
  hash.update(str)
  return hash.digest('hex')
};

// Our banner
const banner = (function() {
    let result = "";
    try {
        result = [
            "/**",
            " * @project        <%= pkg.name %>",
            " * @author         <%= pkg.author %>",
            " * @build          " + $.moment().format("llll") + " ET",
            " * @release        " + $.gitRevSync.long() + " [" + $.gitRevSync.branch() + "]",
            " * @copyright      Copyright (c) " + $.moment().format("YYYY") + ", <%= pkg.copyright %>",
            " *",
            " */",
            ""
        ].join("\n");
    }
    catch (err) {
    }
    return result;
})();

// scss - comb the scss
gulp.task("scss-comb", () => {
    $.fancyLog("-> Compiling scss");
    let originalHashes = []
    return gulp.src([
          pkg.paths.src.scss + '**/*.scss',
          '!' + pkg.paths.src.scss + '**/_columnizer.scss'
        ])
        .pipe(
          through.obj((file, enc, cb) => {
            let hash = hashString(file.contents)
            originalHashes[file.path] = hash
            cb(null, file) // Continue
          })
        )
        .pipe($.csscomb())
        .pipe(
          through.obj((file, enc, cb) => {
            let hash = hashString(file.contents)
            if (originalHashes[file.path] === hash) {
              cb(false) // Hashes match don't proceed to saving
            } else {
              cb(null, file) // Hashes don't mach proceed to saving.
            }
          })
        )
        .pipe(gulp.dest(pkg.paths.src.scss));
});

// scss - build the scss to the build folder, including the required paths, and writing out a sourcemap
let scssTask = () => {
    $.fancyLog("-> Compiling scss");
    return gulp.src(pkg.paths.src.scss + pkg.vars.scssName)
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.sourcemaps.init({loadMaps: true}))
        .pipe(
            $.sass({
                includePaths: pkg.paths.scss
            })
            .on("error", $.sass.logError)
        )
        .pipe($.cached("sass_compile"))
        .pipe($.autoprefixer())
        .pipe($.sourcemaps.write("./"))
        .pipe($.size({gzip: true, showFiles: true}))
        .pipe(gulp.dest(pkg.paths.build.css));
}
gulp.task("scss-fonts", ["scss-fontello", "scss-comb"], scssTask);
gulp.task("scss", ["scss-fonts", "scss-comb"], scssTask);

// css task - combine & minimize any distribution CSS into the public css folder, and add our banner to it
let cssTask = () => {
    $.fancyLog("-> Building css");
    return gulp.src(pkg.globs.distCss)
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.newer({dest: pkg.paths.dist.css + pkg.vars.siteCssName}))
        .pipe($.print())
        .pipe($.sourcemaps.init({loadMaps: true}))
        .pipe($.concat(pkg.vars.siteCssName))
        .pipe($.postcss([
          require('postcss-preset-env')(),
          require('postcss-short')({
            border: false,
            borderRadius: false,
            color: false,
            fontSize: false,
            overflow: false,
          }),
          $.cssMqpacker({
            sort: $.sortCssMediaQueries
          }),
        ]))
        .pipe($.if(process.env.NODE_ENV === "production",
            $.cssnano({
                discardComments: {
                    removeAll: true
                },
                discardDuplicates: true,
                discardEmpty: true,
                minifyFontValues: true,
                minifySelectors: true
            })
        ))
        .pipe($.header(banner, {pkg: pkg}))
        .pipe($.sourcemaps.write("./"))
        .pipe($.size({gzip: true, showFiles: true}))
        .pipe(gulp.dest(pkg.paths.dist.css))
        .pipe($.filter("**/*.css"))
        .pipe($.livereload());
}
// gulp.task("css-fonts", ["scss-fonts"], cssTask);
gulp.task("css", ["css-inline", "scss"], cssTask);

// babel js task - transpile our Javascript into the build directory
gulp.task("js-babel", () => {
    $.fancyLog("-> Transpiling Javascript via Babel...");
    return gulp.src(pkg.globs.babelJs)
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.newer({dest: pkg.paths.build.js}))
        .pipe($.babel())
        .pipe($.size({gzip: true, showFiles: true}))
        .pipe(gulp.dest(pkg.paths.build.js));
});

// components - build .vue VueJS components
gulp.task("components", () => {
    $.fancyLog("-> Compiling Vue Components");
    return gulp.src(pkg.globs.components)
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.newer({dest: pkg.paths.build.js, ext: ".js"}))
        .pipe($.vueify({}))
        .pipe($.size({gzip: true, showFiles: true}))
        .pipe(gulp.dest(pkg.paths.build.js));
});

// inline css task - minimize the inline CSS into _inlinecss in the templates path
gulp.task("css-inline", () => {
  $.fancyLog("-> Copying inline css");
  return gulp.src(pkg.globs.inlineCss)
  .pipe($.plumber({errorHandler: onError}))
  .pipe($.if(["*.css", "!*.min.css"],
    $.newer({dest: pkg.paths.templates + "_inlinecss", ext: ".min.css"}),
    $.newer({dest: pkg.paths.templates + "_inlinecss"})
  ))
  .pipe($.if(["*.css", "!*.min.css"],
    $.rename({suffix: ".min"})
  ))
  .pipe($.postcss([
    require('postcss-preset-env')(),
    require('postcss-short')({
      border: false,
      borderRadius: false,
      color: false,
      fontSize: false,
      overflow: false,
    }),
    $.cssMqpacker({
      sort: $.sortCssMediaQueries
    }),
  ]))
  .pipe($.if(process.env.NODE_ENV === "production",
    $.cssnano({
      discardComments: {
        removeAll: true
      },
      discardDuplicates: true,
      discardEmpty: true,
      minifyFontValues: true,
      minifySelectors: true
    })
  ))
  .pipe($.size({gzip: true, showFiles: true}))
  .pipe(gulp.dest(pkg.paths.templates + "_inlinecss"))
  .pipe($.filter("**/*.css"))
  .pipe($.livereload());
});

// inline js task - minimize the inline Javascript into _inlinejs in the templates path
gulp.task("js-inline", ["js-babel"], () => {
    $.fancyLog("-> Copying inline js");
    return gulp.src(pkg.globs.inlineJs)
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.if(["*.{js,es6}", "!*.min.js"],
            $.newer({dest: pkg.paths.templates + "_inlinejs", ext: ".min.js"}),
            $.newer({dest: pkg.paths.templates + "_inlinejs"})
        ))
        .pipe($.if(["*.{js,es6}", "!*.min.js"],
            $.uglify()
        ))
        .pipe($.if(["*.{js,es6}", "!*.min.js"],
            $.rename({suffix: ".min"})
        ))
        .pipe($.size({gzip: true, showFiles: true}))
        .pipe(gulp.dest(pkg.paths.templates + "_inlinejs"))
        .pipe($.filter("**/*.{js,es6}"))
        .pipe($.livereload());
});

// js task - minimize any distribution Javascript into the public js folder, and add our banner to it
gulp.task("js", ["js-inline"], () => {
    $.fancyLog("-> Building js");
    return gulp.src(pkg.globs.distJs)
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.if(["*.{js,es6}", "!*.min.js"],
            $.newer({dest: pkg.paths.dist.js, ext: ".min.js"}),
            $.newer({dest: pkg.paths.dist.js})
        ))
        .pipe($.if(["*.{js,es6}", "!*.min.js", "!*vue*.js", "!vue-instantsearch.js"],
            $.uglify()
        ))
        .pipe($.if(["*.{js,es6}", "!*.min.js"],
            $.rename({suffix: ".min"})
        ))
        .pipe($.header(banner, {pkg: pkg}))
        .pipe($.size({gzip: true, showFiles: true}))
        .pipe(gulp.dest(pkg.paths.dist.js))
        .pipe($.filter("**/*.js"))
        .pipe($.livereload());
});

// Process data in an array synchronously, moving onto the n+1 item only after the nth item callback
function doSynchronousLoop(data, processData, done) {
    if (data.length > 0) {
        const loop = (data, i, processData, done) => {
            processData(data[i], i, () => {
                if (++i < data.length) {
                    loop(data, i, processData, done);
                } else {
                    done();
                }
            });
        };
        loop(data, 0, processData, done);
    } else {
        done();
    }
}

// Process the critical path CSS one at a time
function processCriticalCSS(element, i, callback) {
    const criticalSrc = pkg.urls.critical + element.url;
    const criticalDest = pkg.paths.templates + element.template + "_critical.min.css";

    let criticalWidth = 1200;
    let criticalHeight = 1200;
    if (element.template.indexOf("amp_") !== -1) {
        criticalWidth = 600;
        criticalHeight = 19200;
    }
    $.fancyLog("-> Generating critical CSS: " + $.chalk.cyan(criticalSrc) + " -> " + $.chalk.magenta(criticalDest));
    $.critical.generate({
        src: criticalSrc,
        dest: criticalDest,
        penthouse: {
            blockJSRequests: false,
            forceInclude: pkg.globs.criticalWhitelist
        },
        inline: false,
        ignore: [],
        css: [
            pkg.paths.dist.css + pkg.vars.siteCssName,
        ],
        minify: true,
        width: criticalWidth,
        height: criticalHeight
    }, (err, output) => {
        if (err) {
            $.fancyLog($.chalk.magenta(err));
        }
        callback();
    });
}

// critical css task
gulp.task("criticalcss", ["css"], (callback) => {
    doSynchronousLoop(pkg.globs.critical, processCriticalCSS, () => {
        // all done
        callback();
    });
});

// Process the downloads one at a time
function processDownload(element, i, callback) {
    const downloadSrc = element.url;
    const downloadDest = element.dest;

    $.fancyLog("-> Downloading URL: " + $.chalk.cyan(downloadSrc) + " -> " + $.chalk.magenta(downloadDest));
    $.download(downloadSrc)
        .pipe(gulp.dest(downloadDest));
    callback();
}

// download task
gulp.task("download", (callback) => {
    doSynchronousLoop(pkg.globs.download, processDownload, () => {
        // all done
        callback();
    });
});

// Run pa11y accessibility tests on each template
function processAccessibility(element, i, callback) {
    const accessibilitySrc = pkg.urls.critical + element.url;
    const cliReporter = require("./node_modules/pa11y/reporter/cli.js");
    const options = {
        log: cliReporter,
        ignore:
            [
                "notice",
                "warning"
            ],
    };
    const test = $.pa11y(options);

    $.fancyLog("-> Checking Accessibility for URL: " + $.chalk.cyan(accessibilitySrc));
    test.run(accessibilitySrc, (error, results) => {
        cliReporter.results(results, accessibilitySrc);
        callback();
    });
}

// accessibility task
gulp.task("a11y", (callback) => {
    doSynchronousLoop(pkg.globs.critical, processAccessibility, () => {
        // all done
        callback();
    });
});

// favicons-generate task
gulp.task("favicons-generate", () => {
    $.fancyLog("-> Generating favicons");
    return gulp.src(pkg.paths.favicon.src).pipe($.favicons({
        appName: pkg.name,
        appDescription: pkg.description,
        developerName: pkg.author,
        developerURL: pkg.urls.live,
        background: "#FFFFFF",
        path: pkg.paths.favicon.path,
        url: pkg.site_url,
        display: "standalone",
        orientation: "portrait",
        version: pkg.version,
        logging: false,
        online: false,
        html: pkg.paths.build.html + "favicons.html",
        replace: true,
        icons: {
            android: false, // Create Android homescreen icon. `boolean`
            appleIcon: true, // Create Apple touch icons. `boolean`
            appleStartup: false, // Create Apple startup images. `boolean`
            coast: true, // Create Opera Coast icon. `boolean`
            favicons: true, // Create regular favicons. `boolean`
            firefox: true, // Create Firefox OS icons. `boolean`
            opengraph: false, // Create Facebook OpenGraph image. `boolean`
            twitter: false, // Create Twitter Summary Card image. `boolean`
            windows: true, // Create Windows 8 tile icons. `boolean`
            yandex: true // Create Yandex browser icon. `boolean`
        }
    })).pipe(gulp.dest(pkg.paths.favicon.dest));
});

// copy favicons task
gulp.task("favicons", ["favicons-generate"], () => {
    $.fancyLog("-> Copying favicon.ico");
    return gulp.src(pkg.globs.siteIcon)
        .pipe($.size({gzip: true, showFiles: true}))
        .pipe(gulp.dest(pkg.paths.dist.base));
});

// imagemin task
gulp.task("imagemin", () => {
    $.fancyLog("-> Minimizing images in " + pkg.paths.src.img);
    return gulp.src(pkg.paths.src.img + "**/*.{png,jpg,jpeg,gif,svg}")
        .pipe($.imagemin({
            progressive: true,
            interlaced: true,
            optimizationLevel: 7,
            svgoPlugins: [{removeViewBox: false}],
            verbose: true,
            use: []
        }))
        .pipe(gulp.dest(pkg.paths.dist.img));
});

// generate-fontello task
gulp.task("generate-fontello", () => {
    return gulp.src(pkg.paths.src.fontello + "config.json")
        .pipe($.fontello({
          host: 'https://fontello.pennebaker.io'
        }))
        .pipe($.print())
        .pipe(gulp.dest(pkg.paths.build.fontello));
});

// scss-fontello task
gulp.task("scss-fontello", ["fonts"], () => {
    return gulp.src(pkg.paths.build.fontello + "css/fontello-codes.css")
        .pipe($.replace(/^\.([a-z0-9\-]+):before { content(: '\\[a-z0-9]+';) }(.*)$/gmi, "$$$1$2$3"))
        .pipe($.rename({ prefix: "_", extname: ".scss" }))
        .pipe(gulp.dest(pkg.paths.build.fontello + "scss/"));
});

// copy fonts task
gulp.task("fonts", ["generate-fontello"], () => {
  return gulp.src(pkg.globs.fonts)
  .pipe(gulp.dest(pkg.paths.dist.fonts));
});

// empty build folder
gulp.task("clean-build", () => {
  return gulp.src(pkg.paths.build.base, { read: false })
    .pipe($.clean());
});

// static assets version task
gulp.task("static-assets-version", () => {
    gulp.src(pkg.paths.craftConfig + "general.php")
        .pipe($.replace(/'staticAssetsVersion' => (\d+),/g, function(match, p1, offset, string) {
            p1++;
            $.fancyLog("-> Changed staticAssetsVersion to " + p1);
            return "'staticAssetsVersion' => " + p1 + ",";
        }))
        .pipe(gulp.dest(pkg.paths.craftConfig));
});

// set the node environment to development
gulp.task("set-dev-node-env", function() {
    $.fancyLog("-> Setting NODE_ENV to development");
    return process.env.NODE_ENV = "development";
});

// empty build folder
gulp.task("do-build", ["clean-build"], () => {
  gulp.start("css", "js", "download", "favicons", "imagemin")
});

// set the node environment to production
gulp.task("set-prod-node-env", function() {
    $.fancyLog("-> Setting NODE_ENV to production");
    return process.env.NODE_ENV = "production";
});

// Default task
gulp.task("default", ["set-dev-node-env", "do-build"], () => {
    $.fancyLog("-> Livereload listening for changes");
    $.livereload.listen();
    gulp.watch([pkg.paths.src.fontello + "config.json"], ["scss-fonts"]);
    gulp.watch([pkg.paths.src.scss + "**/*.scss"], ["css"]);
    gulp.watch([pkg.paths.src.js + "**/*.{js,es6}"], ["js"]);
    gulp.watch([pkg.paths.templates + "**/*.{html,htm,twig}"], () => {
        gulp.src(pkg.paths.templates)
            .pipe($.plumber({errorHandler: onError}))
            .pipe($.livereload());
    });
});

// Production build
gulp.task("build", ["set-prod-node-env", "do-build"]);
