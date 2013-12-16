
(function()
{
    // Get environment name from index.html build target
    var environment = "local";
    var configuration = window.hasOwnProperty('apiRoot') ? window.apiRoot : 'dev';

    var wwwRoots =
    {
        dev: "http://www.dev.trainingpeaks.com",
        local: "http://www.local.trainingpeaks.com"
    };

    var homeRoots =
    {
        dev: "http://cat6.dev.trainingpeaks.com",
        local: "http://cat6.local.trainingpeaks.com"
    };

    var apiRoots =
    {
        dev: "http://tpapi.dev.trainingpeaks.com",
        local: "http://tpapi.local.trainingpeaks.com"
    };

    var oAuthRoots =
    {
        dev: "http://oauth.dev.trainingpeaks.com",
        local: "http://oauth.local.trainingpeaks.com"
    };

    window.apiConfig =
    {
        environment: environment,
        configuration: configuration,
        wwwRoot: wwwRoots[configuration],
        homeRoot: homeRoots[configuration],
        cmsRoot: "https://home.dev.trainingpeaks.com",
        apiRoot: apiRoots[configuration],
        oAuthRoot: oAuthRoots[configuration],
        buildNumber: "local",
        gaAccount: "",
        buildHash: "",
        devWwwRoot: wwwRoots.dev,
        coachUpgradeURL: "https://cat6.dev.trainingpeaks.com/account-professional-edition.aspx",
        upgradeURL: "https://home.dev.trainingpeaks.com/account-manager/athlete-upgrade",
        helpURL: "http://help.trainingpeaks.com",
        trainingPlanStoreUrl: "https://home.dev.trainingpeaks.com/products/trainingplans"
    };

    if (typeof global !== "undefined")
    {
        global.apiConfig = window.apiConfig;
    }
})();
