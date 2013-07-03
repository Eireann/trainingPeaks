
(function()
{
    // Get environment name from index.html build target
    var configuration = window.hasOwnProperty('apiRoot') ? window.apiRoot : 'dev';

    var wwwRoots =
    {
        dev: "http://www.dev.trainingpeaks.com",
        local: "http://localhost:8905"
    };

    var apiRoots =
    {
        dev: "http://tpapi.dev.trainingpeaks.com",
        local: "http://localhost:8901"
    };

    var oAuthRoots =
    {
        dev: "http://oauth.dev.trainingpeaks.com",
        local: "http://localhost:8900"
    };

    window.apiConfig = {
        configuration: configuration,
        wwwRoot: wwwRoots[configuration],
        apiRoot: apiRoots[configuration],
        oAuthRoot: oAuthRoots[configuration]
    };

    if (typeof global !== "undefined")
    {
        global.apiConfig = window.apiConfig;
    }
})();
