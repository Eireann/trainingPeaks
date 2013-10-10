
(function()
{
    // Get environment name from index.html build target
    var environment = "local";
    var configuration = window.hasOwnProperty('apiRoot') ? window.apiRoot : 'dev';

    var wwwRoots =
    {
        dev: "http://www.dev.trainingpeaks.com",
        local: "http://localhost:8905"
    };

    var homeRoots =
    {
        dev: "http://home.dev.trainingpeaks.com",
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

    window.apiConfig =
    {
        environment: environment,
        configuration: configuration,
        wwwRoot: wwwRoots[configuration],
        homeRoot: homeRoots[configuration],
        cmsRoot: "http://cms.dev.trainingpeaks.com",
        apiRoot: apiRoots[configuration],
        oAuthRoot: oAuthRoots[configuration],
        buildNumber: "local",
        gaAccount: "",
        buildHash: "",
        devWwwRoot: wwwRoots.dev,
        logoutUrl: "/login.html",

        coachUpgradeURL: "https://home.dev.trainingpeaks.com/account-professional-edition.aspx",
        upgradeURL: "https://home.dev.trainingpeaks.com/create-account-personal-edition.aspx?login=true&utm_source=tpflex&utm_medium=trigger&utm_content=premiumfeature&utm_campaign=put"
    };

    if (typeof global !== "undefined")
    {
        global.apiConfig = window.apiConfig;
    }
})();
