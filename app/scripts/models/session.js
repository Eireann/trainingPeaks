define(
[
    "jquery",
    "underscore",
    "TP",
    "shared/models/userModel",
    "shared/models/userAccessRightsModel"
],
function ($, _, TP, UserModel, UserAccessRightsModel)
{
    // 4 hour interval in milliseconds
    var REFRESH_INTERVAL = 1000 * 60 * 60 * 4;

    var REDIRECT_URL = "";

    return TP.Model.extend(
    {

        defaults:
        {
            isAuthenticated: true
        },

        initialize: function()
        {
            var self = this;

            $.ajaxSetup(
            {
                xhrFields:
                {
                    withCredentials: true
                }
            });

            $(document).ajaxSend(function(event, xhr, settings)
            {
                if (typeof theMarsApp !== "undefined" && theMarsApp && !theMarsApp.isLive())
                    window.lastAjaxRequest = { settings: settings, xhr: xhr };
            });

            $(document).ajaxError(function(event, xhr)
            {
                if (xhr.status === 401)
                    self._redirectToLogin();
            });

            this.userPromise = $.Deferred();
            this.userAccessPromise = $.Deferred();
            this.user = new UserModel();
            this.userAccessRights =  new UserAccessRightsModel();

        },

        initRefreshToken: function()
        {
            var self = this;
            
            this._refreshToken().done(function(data)
            {
                self._fetchUser({ user: data.user });
            });
        },

        _fetchUser: function(options)
        {
            var self = this;
            this.userAccessRights.fetch().done(function()
            {
                self.userAccessPromise.resolve();
            });
            this.user.fetch(options).done(function()
            {
                self.userPromise.resolve();
            });
        },

        _refreshToken: function()
        {
            if(!(window.apiConfig && window.apiConfig.cmsRoot))
                throw "No CMSRoot URL found!";

            var self = this;
            var promise = $.ajax(
            {
                url: window.apiConfig.cmsRoot + "/refresh",
                type: "GET",
                contentType: "application/json",
                crossDomain: true,
                dataType: "json"
            });

            promise.done(function(data, textStatus, jqXHR)
            {
                if(data.success)
                {
                    if(data.redirect && data.redirect !== "")
                        REDIRECT_URL = data.redirect;
                    
                    setTimeout(_.bind(self._refreshToken, self), REFRESH_INTERVAL);
                }
                else
                {
                    if(data.redirect && data.redirect !== "")
                       REDIRECT_URL = data.redirect;

                    self._redirectToLogin();
                }
            });

            return promise;
        },

        _redirectToLogin: function()
        {
            if(REDIRECT_URL)
                window.location = REDIRECT_URL + "?ReturnUrl=" + encodeURIComponent(window.location);
        },

        authenticationComplete: function(callback)
        {
            $.when(this.userPromise, this.userAccessPromise).done(callback);
        },

        logout: function()
        {
            document.location = window.apiConfig.cmsRoot + "/logout";
        }
    });
});
