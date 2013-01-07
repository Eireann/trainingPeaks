// Set the require.js configuration for your application.
require.config(
{
    deps: ["../vendor/jam/require.config", "main"],

    paths:
    {
        "models": "scripts/models",
        "views": "scripts/views",
        "controllers": "scripts/controllers"
    },

    shim:
    {
                
    },

    hbt:
    {
        extension: "html"
    }
});
