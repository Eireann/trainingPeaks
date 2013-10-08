var fs = require("fs");
var path = require("path");
var crypto = require("crypto");

module.exports = function(grunt)
{

  var _ = grunt.util._;

  var cacheable = [];

  function versionFile(file)
  {
    var content = fs.readFileSync(file);
    var hash = crypto.createHash("md5");
    hash.update(content);
    
    var rev = hash.digest('hex').slice(0, 12);

    var newFile = path.join(path.dirname(file), rev + "." + path.basename(file))
    fs.renameSync(file, newFile);
    cacheable.push(newFile);

    if(fs.existsSync(file + ".map"))
    {
      fs.renameSync(file + ".map", newFile + ".map");
      cacheable.push(newFile + ".map");
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

      var cacheConfig = _.map(cacheable, function(file)
      {
        return '<location path="' + file.replace("build/release/", "") + '"><system.webServer><staticContent><clientCache cacheControlCustom="public" cacheControlMode="UseMaxAge" cacheControlMaxAge="365.00:00:00" /></staticContent></system.webServer></location>';
      }).join();

      var webConfig = fs.readFileSync('build/release/web.config', "utf-8");
      webConfig = webConfig.replace('<!--AUTOGENERATE_JS_CSS_CACHE_CONTROL_HEADERS-->', cacheConfig);
      fs.writeFileSync('build/release/web.config', webConfig);

    });

  });

}
