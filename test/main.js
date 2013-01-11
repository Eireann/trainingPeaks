var tests = Object.keys(window.__testacular__.files).filter(function (file)
{
    return /\.test\.js$/.test(file);
});

require(
{

    // !! Testacular serves files from '/base'
    baseUrl: '/base/src',
    paths:
    {
        require: '../vendor/js/libs/require',
        text: '../lib/text'
    },
},
tests,
function()
{
    window.__testacular__.start();
});