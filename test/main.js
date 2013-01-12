var tests = Object.keys(window.__testacular__.files).filter(function (file)
{
    return /\.spec\.js$/.test(file);
});

require(
{

    // !! Testacular serves files from '/base'
    baseUrl: "../",
    paths:
    {
        app: "app/app",
        views: "app/scripts/views",
        controllers: "app/scripts/controllers",
        models: "app/scripts/models",
        
        require: 'vendor/js/libs/require'
    }
},
tests,
function()
{
    window.__testacular__.start();
});