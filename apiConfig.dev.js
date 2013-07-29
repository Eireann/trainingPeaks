
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
        oAuthRoot: oAuthRoots[configuration],
        buildNumber: "local",
        coachUpgradeURL: "https://home.dev.trainingpeaks.com/create-account-personal-edition.aspx?login=true&utm_source=tpflex&utm_medium=trigger&utm_content=premiumfeature&utm_campaign=put",
        upgradeURL:"https://home.dev.trainingpeaks.com/account-professional-edition.aspx?s=859edf69-504e-443a-bd0a-b2c6d095b325"
    };

    if (typeof global !== "undefined")
    {
        global.apiConfig = window.apiConfig;
    }
})();
