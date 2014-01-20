define(function(require) {

    var Handlebars = require("handlebars");
    var text = require("text");
    var i18n = require("i18n!locales/nls/templates");

    var buildMap = {};

    Handlebars.registerHelper("$", function(key) {
        var text = Handlebars.Utils.escapeExpression(i18n[key]);
        var html = text.replace(/\n/g, '<br/>');

        return new Handlebars.SafeString(html);
    });
    Handlebars.registerHelper("comment", function() { return ""; });

    function process(template) {
        var deps = [], ast = Handlebars.parse(template);

        walk(deps, ast.statements);

        return {
            ast:ast,
            deps: deps
        };
    }

    function requireHelper(deps, node) {
        var helper = node.id.string;
        if(!Handlebars.helpers[helper]) {
            deps.push("scripts/helpers/" + helper);
        }
    }

    function walk(deps, nodes) {
        for(var i = 0; i < nodes.length; i++) {
            var node = nodes[i];

            if(node.type === "partial") {
                deps.push("hbs!" + node.partialName.name + "!partial");
            } else if(node.mustache) {
                requireHelper(deps, node.mustache);
            } else if(node.isHelper) {
                requireHelper(deps, node);
            }

            if(node.program) {
                walk(deps, node.program.statements);
            }

            if(node.inverse) {
                walk(deps, node.inverse.statements);
            }
        }
    }

    return {
        load: function(name, req, onload, config) {
            if(/!partial$/.test(name)) {
                var partial = name.match(/^(.*)!partial$/)[1];
                var path = partial.replace(/_/g, '/');
                req(["hbs!" + path], function(template) {
                    Handlebars.registerPartial(partial, template);
                    onload(template);
                });
            } else {
                text.get(req.toUrl(name) + ".html", function(template) {
                    var processed = process(template);

                    if(config.isBuild) {
                        buildMap[name] = processed;
                    }

                    req(processed.deps, function() {
                        onload(Handlebars.compile(processed.ast));
                    });
                }, function(error) {
                    throw Error("Could not load handlebars template:" + error);
                });
            }
        },

        write: function(pluginName, moduleName, write) {
            var text = "";
            if(/!partial$/.test(moduleName)) {
                var partial = moduleName.match(/^(.*)!partial$/)[1];
                var path = partial.replace(/_/g, '/');

                text += "define(\"" + pluginName + "!" + moduleName + "\", ";
                text += JSON.stringify(["handlebars", "hbs!" + path]);
                text += ", function(Handlebars, template) { Handlebars.registerPartial(" + JSON.stringify(partial) + ", template); })";
            } else if(moduleName in buildMap) {
                var processed = buildMap[moduleName];
                text += "define(\"" + pluginName + "!" + moduleName + "\", ";
                text += JSON.stringify(["handlebars"].concat(processed.deps));
                text += ", function(Handlebars) { return Handlebars.template(" + Handlebars.precompile(processed.ast) + "); })";
            }
            write(text);
        }
    };

});
