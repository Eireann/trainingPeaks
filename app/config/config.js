define(
["./commonRequirejsConfig"],
function (commonConfig) {
    requirejs.config(commonConfig);
    requirejs.config(
    {
        baseUrl: './app',
        deps: ["main", "Backbone.Marionette.Handlebars"]
    });

});
