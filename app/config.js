// Set the require.js configuration for your application.
require.config(
{
    deps: ["../vendor/jam/require.config", "main"],

    paths:
    {
        "models": "scripts/models",
        "views": "scripts/views",
        "controllers": "scripts/controllers",
        
        "i18nprecompile": "../vendor/js/libs/i18nprecompile",
        "json2": "../vendor/js/libs/json2",
        "hbs": "../vendor/js/libs/hbs"
    },
    shim:
    {
    },
    hbs:
    {
        templateExtension: "html",
        i18nDirectory: "../../templates/i18n/"
    }
});
