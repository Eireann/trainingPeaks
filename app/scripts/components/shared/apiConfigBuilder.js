define(
[
    "underscore"
],
function(
         _
        )
{

    var ApiConfigBuilder = { 

        buildApiConfig: function()
        {
            var apiConfig = _.defaults({}, window.apiConfig, { 
                coachUpgradeURL: "//home.trainingpeaks.com/account-professional-edition.aspx",
                upgradeURL: "//home.trainingpeaks.com/account-manager/athlete-upgrade"
            });

            var hostNameMatch = document.location.hostname.match(/([a-z]+\.trainingpeaks\.com|localhost)/);
            var subdomain = "";
            if(hostNameMatch && hostNameMatch.length === 2)
            {
                subdomain = hostNameMatch[1];
            }

            switch(subdomain)
            {
                case "localhost":
                case "local.trainingpeaks.com":
                    var port = document.location.port ? ":" + document.location.port : "";
                    apiConfig.env = "local";
                    apiConfig.wwwRoot = "//www.dev.trainingpeaks.com";
                    apiConfig.appRoot = "//app.local.trainingpeaks.com" + port;
                    apiConfig.cmsRoot = "//home.local.trainingpeaks.com";
                    apiConfig.apiRoot = "https://tpapi.dev.trainingpeaks.com";
                    apiConfig.gaAccount = "UA-42726244-3";
                    break;

                case "dev.trainingpeaks.com":
                    apiConfig.env = "dev";
                    apiConfig.wwwRoot = "//www.dev.trainingpeaks.com";
                    apiConfig.appRoot = "//app.dev.trainingpeaks.com";
                    apiConfig.cmsRoot = "//home.dev.trainingpeaks.com";
                    apiConfig.apiRoot = "https://tpapi.dev.trainingpeaks.com";
                    apiConfig.gaAccount = "UA-42726244-1";
                    break;

                case "sandbox.trainingpeaks.com":
                    apiConfig.env = "sandbox";
                    apiConfig.wwwRoot = "//www.sandbox.trainingpeaks.com";
                    apiConfig.appRoot = "//app.sandbox.trainingpeaks.com";
                    apiConfig.cmsRoot = "//home.sandbox.trainingpeaks.com";
                    apiConfig.apiRoot = "https://tpapi.sandbox.trainingpeaks.com";
                    break;

                default:
                    apiConfig.env = "live";
                    apiConfig.wwwRoot = "//www.trainingpeaks.com";
                    apiConfig.appRoot = "//app.trainingpeaks.com";
                    apiConfig.cmsRoot = "//home.trainingpeaks.com";
                    apiConfig.apiRoot = "https://tpapi.trainingpeaks.com";
                    apiConfig.gaAccount = "UA-42726244-2";
                    break;
            }

        
            if(!apiConfig.assetsRoot)
            {
                apiConfig.assetsRoot = apiConfig.appRoot + "/assets/";
            }

            if(!apiConfig.cssRoot)
            {
                apiConfig.cssRoot = apiConfig.appRoot + ( apiConfig.appRoot.indexOf("local") >= 0 ? "/build/debug" : "");
            }

            return apiConfig;
        }
    };
    
    return ApiConfigBuilder;
});

