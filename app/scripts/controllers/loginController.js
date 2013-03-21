define(
[
    "TP",
    "layouts/loginLayout",
    "views/loginView"
],
function(TP, LoginLayout, LoginView)
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

        onLogout: function()
        {
            theMarsApp.router.navigate("login");
            window.location.reload();
        }
        
    });
});
