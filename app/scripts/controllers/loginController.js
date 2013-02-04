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
        },
        
        show: function()
        {
            if (this.views.loginView)
                this.views.loginView.close();
            
            this.views.loginView = new LoginView({ model: theMarsApp.session });

            var self = this;

            this.views.loginView.on("login:success", function()
            {
                self.trigger("login:success");
            });

            this.layout.mainRegion.show(this.views.loginView);
        }
        
    });
});
