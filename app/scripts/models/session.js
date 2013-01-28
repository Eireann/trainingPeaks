define(
[
    "jquery",
    "underscore",
    "TP",
    "app"
],
function ($, _, TP, theApp)
{
    "use strict";

    var Session = TP.Model.extend(
    {
        url: function()
        {
            return theApp.apiRoot + "/OAuthAuthorizationServer/OAuth/Token";
        },

        storageLocation: localStorage,

        initialize: function ()
        {
            _.bindAll(this);
            
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

            var self = this;
            this.fetch(
            {
                data: data, type: "POST", contentType: "application/x-www-form-urlencoded"
            }).done(function ()
            {
                var expiresOn = Number(self.get("expires_in")) + Number((new Date()).getTime() / 1000);
                
                self.storageLocation.setItem("access_token", self.get("access_token"));
                self.storageLocation.setItem("expires_on", expiresOn);
                self.storageLocation.setItem("username", self.username);
                
                self.set("username", self.username);
                
                self.trigger("api:authorization:success");
            }).error(function()
            {
                self.trigger("api:authorization:failure");
            });
        }
    });

    return new Session();
});