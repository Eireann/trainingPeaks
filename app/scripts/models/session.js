define(
[
    "jquery",
    "underscore",
    "backbone"
],
function ($, _, Backbone)
{
    'use strict';

    var Session = Backbone.Model.extend(
    {
        //url: "https://api.trainingpeaks.com/OAuthAuthorizationServer/OAuth/Token",
        url: "http://localhost:8900/OAuthAuthorizationServer/OAuth/Token",
        
        defaults:
        {
            username: null      
        },
        
        initialize: function ()
        {
            _.bindAll(this);
            var accessToken = sessionStorage.getItem("access_token");
            if (accessToken)
            {
                var expiresOn = sessionStorage.getItem("expires_on");
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
            var data = {
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
                sessionStorage.setItem("access_token", self.get("access_token"));
                sessionStorage.setItem("expires_on", expiresOn);
            });
        }
    });

    return new Session();
});