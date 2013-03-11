define(
["./commonRequirejsConfig"],
function(commonConfig)
{
    commonConfig.paths.specs = "../test/specs";
    commonConfig.baseUrl = "./app";
    commonConfig.deps = ["Backbone.Marionette.Handlebars"];
    return commonConfig;
});
