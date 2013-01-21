define(
[
    "jquery",
    "underscore",
    "backbone"
],
function ($, _, Backbone)
{
    "use strict";

    var Session = Backbone.Model.extend(
    {
        //url: "https://apideploy.trainingpeaks.com/OAuthAuthorizationServer/OAuth/Token",
        url: "http://apidev.trainingpeaks.com/OAuthAuthorizationServer/OAuth/Token",
        //url: "http://localhost:8900/OAuthAuthorizationServer/OAuth/Token",

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
                }
            }
        },

        isAuthenticated: function ()
        {
            return this.get("access_token") && this.get("access_token").length > 0;
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
            this.fetch({ data: data, type: "POST", contentType: "application/x-www-form-urlencoded" }).done(function ()
            {
                var expiresOn = Number(self.get("expires_in")) + Number((new Date()).getTime() / 1000);
                this.storageLocation.setItem("access_token", self.get("access_token"));
                this.storageLocation.setItem("expires_on", expiresOn);
                self.trigger("api:authorized");
            });
        }
    });

    return new Session();
});