define(
[
    "underscore",
    "TP",
    "shared/models/userModel",
    "shared/models/userAccessRightsModel"
],
function (_, TP, UserModel, UserAccessRightsModel)
{
    // 4 hour interval in milliseconds
    var REFRESH_INTERVAL = 1000 * 60 * 60 * 4;
    var REDIRECT_URL = "";

    return TP.Model.extend(
    {
        storageLocation: localStorage,

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
            this.user = new UserModel();
            this.userAccessRights =  new UserAccessRightsModel();

        },

        initRefreshToken: function()
        {
            var self = this;

            if(localStorage.getItem("local_access_token"))
            {
                $(document).ajaxSend(function(event, xhr, settings)
                {
                    xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("local_access_token"));
                });

                this._fetchUser();
                return;
            }
            
            this._refreshToken().done(function()
            {
                //console.log("REFRESH: DONE: FETCHUSER");
                self._fetchUser();
            });
        },

        _fetchUser: function()
        {
            var self = this;
            this.userAccessPromise = this.userAccessRights.fetch();
            this.user.fetch().done(function()
            {
                self.userPromise.resolve();
            });
        },

        _refreshToken: function()
        {
            //console.log("REFRESH");

            if(!(window.apiConfig && window.apiConfig.cmsRoot))
                throw "No CMSRoot URL found!";

            var self = this;
            var promise = $.ajax(
            {
                url: window.apiConfig.cmsRoot + "/refresh",
                type: "GET",
                contentType: "application/json",
                crossDomain: true
            });

            promise.done(function(data, textStatus, jqXHR)
            {
                //console.log("REFRESH: DONE");
                if(data.responseText && data.responseText !== "")
                    REDIRECT_URL = data.responseText;
                
                setTimeout(self._refreshToken, REFRESH_INTERVAL);
            }).fail(function(data, textStatus, jqXHR)
            {
                //console.log("REFRESH: FAIL");
                //console.log(arguments);
                if(data.status === 400)
                {
                    if(data.responseText && data.responseText !== "")
                       REDIRECT_URL = data.responseText;

                    self._redirectToLogin();
                }
            });

            return promise;
        },

        _redirectToLogin: function()
        {
            if(REDIRECT_URL)
                window.location = REDIRECT_URL + "?redirect=" + window.location;
        },

        authenticationComplete: function(callback)
        {
            this.userPromise.done(callback);
        }
    });
});
