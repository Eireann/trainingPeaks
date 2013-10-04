var fs = require("fs");
var path = require("path");
var crypto = require("crypto");

module.exports = function(grunt)
{

  var _ = grunt.util._;

  function versionFile(file)
  {
    var content = fs.readFileSync(file);
    var hash = crypto.createHash("md5");
    hash.update(content);
    
    var rev = hash.digest('hex').slice(0, 12);

    var newFile = path.join(path.dirname(file), rev + "." + path.basename(file))
    fs.renameSync(file, newFile);

    if(fs.existsSync(file + ".map"))
    {
      fs.renameSync(file + ".map", newFile + ".map");
    }

    return rev;
  }

  grunt.registerTask("revision", function()
  {

    var indexFiles = grunt.file.expand("build/release/**/index.html");
    _.each(indexFiles, function(indexFile)
    {
      var baseDir = path.dirname(indexFile);

      var versions =
      {
        appCss: versionFile(path.join(baseDir, "app/css/app.css")),
        printCss: versionFile(path.join(baseDir, "app/css/print.css")),
        singleJs: versionFile(path.join(baseDir, "single.min.js"))
      };

      var content = fs.readFileSync(indexFile, "utf-8");

      content = content
      .replace('"app/css/app.css"', '"app/css/' + versions.appCss + '.app.css"')
      .replace('"app/css/print.css"', '"app/css/' + versions.printCss + '.print.css"')
      .replace('"single.min.js"', '"' + versions.singleJs + '.single.min.js"');
      
      fs.writeFileSync(indexFile, content);

    });

  });

}
