define(
[
    "underscore",
    "TP",
    "shared/models/userModel"
],
function (_, TP, UserModel)
{
    return TP.Model.extend(
    {
        url: function()
        {
            return theMarsApp.oAuthRoot + "/OAuth/Token";
        },

        storageLocation: localStorage,

        initialize: function()
        {
            this.authPromise = new $.Deferred();

            var accessToken = this.getFromLocalStorage("access_token");

            if (accessToken)
            {
                var expiresOn = this.getFromLocalStorage("expires_on");
                var now = parseInt(+new Date(), 10) / 1000;
                if (now < expiresOn)
                {
                    this.set("access_token", accessToken);
                    this.authPromise.resolve();
                }
            }
        },

        isAuthenticated: function()
        {
            var token = this.get("access_token");
            return !!token && (token.length > 0);
        },

        authenticate: function (options)
        {
            var data =
            {
                grant_type: "password",
                client_id: "tpMars",
                client_secret: "44Wz6Em3lcpDSzbZ5WCl2ijZqtAfDUfPU5RMawx6W00=",
                username: options.username,
                password: options.password,
                response_type: "token",
                scope: "fitness clientevents users athletes exerciselibrary images groundcontrol baseactivity plans sysinfo metrics"
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

            this.setToLocalStorage("access_token", this.get("access_token"));
            this.setToLocalStorage("expires_on", expiresOn);

            this.authPromise.resolve();
            this.trigger("api:authorization:success");
        },
        
        onAuthenticationFailure: function()
        {
            var originalPromise = this.authPromise;
            this.authPromise = new $.Deferred();
            originalPromise.reject();
            this.trigger("api:authorization:failure");
        },
        
        logout: function(message)
        {
            this.removeFromLocalStorage("access_token");
            this.removeFromLocalStorage("app_user");
            this.trigger("logout", message);
        },

        setToLocalStorage: function(key, value)
        {
            this.storageLocation.setItem(key, value);
        },

        getFromLocalStorage: function(key)
        {
            return this.storageLocation.getItem(key);
        },

        removeFromLocalStorage: function(key)
        {
            this.storageLocation.removeItem(key);
        },

        saveUserToLocalStorage: function(user)
        {
            this.setToLocalStorage("app_user", JSON.stringify(user.attributes));
        },

        getUserFromLocalStorage: function()
        {
            var storedUser = this.getFromLocalStorage("app_user");
            if(!storedUser)
            {
                return null;
            }
            return new UserModel(JSON.parse(storedUser));
        }
    });
});
