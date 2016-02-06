'use strict';

let fs = require("fs")
let browserify = require("browserify")
browserify("./test/index.js")
  .transform("babelify", {presets: ["es2015"]})
  .bundle()
  .pipe(fs.createWriteStream("./test/bundle.js"))
