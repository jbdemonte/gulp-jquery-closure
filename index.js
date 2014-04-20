var through = require("through"),
  gutil = require("gulp-util"),
  Buffer = require("buffer").Buffer,
  PluginError = gutil.PluginError,
  File = gutil.File;

module.exports = function (options) {
  if (typeof options !== "object") {
    options = {};
  }

  if (typeof options.newLine !== "string") {
    options.newLine = gutil.linefeed;
  }

  var file = null;

  function write (f){
    if (!f.isNull()) {
      if (f.isStream()) {
        this.emit("error", new PluginError("gulp-jquery-closure",  "Streaming not supported"));
      } else {
        file = f;
      }
    }
  }

  function end () {
    var newFile,
      params = [],
      call = [];
    if (options.$ !== false) {
      params.push("$");
      call.push("jQuery");
    }
    if (options.window) {
      params.push("window");
      call.push("window");
    }
    if (options.document) {
      params.push("document");
      call.push("document");
    }
    if (options.undefined) {
      params.push("undefined");
    }
    newFile = new File({
      cwd: file.cwd,
      base: file.base,
      path: file.path,
      contents: Buffer.concat([
        new Buffer(";(function (" + params.join(", ") + ") {" + options.newLine),
        file.contents,
        new Buffer(options.newLine + "})(" + call.join(", ") + ");")
      ])
    });

    this.emit("data", newFile);
    this.emit("end");
  }

  return through(write, end);
};
