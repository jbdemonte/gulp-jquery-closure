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
      params.push(typeof options.$ === "string" ? options.$ : "$");
      call.push("jQuery");
    }

    for (var i in options) {
      if (options.hasOwnProperty(i)) {
        if (options[i] && i !== 'newLine' && i !== '$') {
          params.push(typeof options[i] === "string" ? options[i] : i);
          if (i !== 'undefined') {
            call.push(i);
          } 
        }
      }
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
