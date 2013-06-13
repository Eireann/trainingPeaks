define(
[
    "TP",
    "layouts/loginLayout",
    "views/loginView",
    "views/userMessageView"
],
function(TP, LoginLayout, LoginView, UserMessageView)
{
    return TP.Controller.extend(
    {
        views: {},
        
        initialize: function()
        {
            this.layout = new LoginLayout();
            this.layout.on("show", this.show, this);
            theMarsApp.session.on("logout", this.onLogout, this);
        },
        
        show: function()
        {
            if (theMarsApp.session.isAuthenticated())
            {
                theMarsApp.session.logout();
                return;
            }

            if (this.views.loginView)
                this.views.loginView.close();
            
            this.views.loginView = new LoginView({ model: theMarsApp.session });

          
            this.views.loginView.on("login:success", this.onLoginSuccess, this);

            this.layout.mainRegion.show(this.views.loginView);
        },

        onLoginSuccess: function ()
        {
            this.trigger("login:success");
            theMarsApp.clientEvents.logEvent({ Event: { Type: "Login", Label: "Login", AppContext: "Login" } });
        },

        onLogout: function(message)
        {
            theMarsApp.router.navigate("login");
            setImmediate(function()
            {
                if (false)
                {
                    var view = new UserMessageView({ template: message });
                    view.render();
                    view.onClose = function ()
                    {
                        theMarsApp.reloadApp();
                    };
                }
                else
                    theMarsApp.reloadApp();
            });
        }
    });
});
