
// Get environment name from index.html build target
var configuration = window.hasOwnProperty('apiRoot') ? window.apiRoot : 'dev';

var wwwRoots =
{
    live: "http://www.trainingpeaks.com",
    uat: "http://www.uat.trainingpeaks.com",
    dev: "http://www.dev.trainingpeaks.com",
    local: "http://localhost:8905",
    todd: "DEV20-T430:8901"
};

var apiRoots =
{
    live: "https://tpapi.trainingpeaks.com",
    uat: "http://tpapi.uat.trainingpeaks.com",
    dev: "http://tpapi.dev.trainingpeaks.com",
    local: "http://localhost:8901",
    todd: "DEV20-T430:8901"
};

var oAuthRoots =
{
    live: "https://oauth.trainingpeaks.com",
    uat: "http://oauth.uat.trainingpeaks.com",
    dev: "http://oauth.dev.trainingpeaks.com",
    local: "http://localhost:8900",
    todd: "DEV20-T430:8900"
};

window.apiConfig = {
    configuration: configuration,
    wwwRoot: wwwRoots[configuration],
    apiRoot: apiRoots[configuration],
    oAuthRoot: oAuthRoots[configuration]
};
