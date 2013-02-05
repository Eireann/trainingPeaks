define(
[
    "underscore",
    "TP"
],
function (_, TP)
{
    "use strict";

    var Session = TP.Model.extend(
    {
        url: function()
        {
            return theMarsApp.apiRoot + "/OAuthAuthorizationServer/OAuth/Token";
        },

        storageLocation: localStorage,

        initialize: function()
        {
            var accessToken = this.storageLocation.getItem("access_token");
            if (accessToken)
            {
                var expiresOn = this.storageLocation.getItem("expires_on");
                var now = (new Date()).getTime() / 1000;
                if (now < expiresOn)
                {
                    this.set("access_token", accessToken);
                    this.set("username", this.storageLocation.getItem("username"));
                }
            }
        },

        isAuthenticated: function ()
        {
            var token = this.get("access_token");
            return !!token && (token.length > 0);
        },

        authenticate: function (options)
        {
            var data =
            {
                grant_type: "password",
                client_id: "tpconsumer",
                client_secret: "tpsecret",
                username: options.username,
                password: options.password,
                response_type: "token",
                scope: "Fitness"
            };

            this.username = options.username;

            _.bindAll(this, "onAuthenticationSuccess", "onAuthenticationFailure");

            this.fetch(
            {
                data: data,
                type: "POST",
                contentType: "application/x-www-form-urlencoded"
            }).done(this.onAuthenticationSuccess).error(this.onAuthenticationFailure);
        },
        
        onAuthenticationSuccess: function()
        {
            var expiresOn = parseInt(this.get("expires_in"), 10) + parseInt((+new Date()) / 1000, 10);

            this.storageLocation.setItem("access_token", this.get("access_token"));
            this.storageLocation.setItem("expires_on", expiresOn);
            this.storageLocation.setItem("username", this.username);

            this.set("username", this.username);

            this.trigger("api:authorization:success");
        },
        
        onAuthenticationFailure: function()
        {
            this.trigger("api:authorization:failure");
        }

    });

    return Session;
});