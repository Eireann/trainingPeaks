define(
[
    "TP",
    "layouts/navigationLayout",
    "views/userControlsView",
    "views/navigationView",
    
    "models/session"
],
function(TP, NavigationLayout, UserControlsView, NavigationView, theSession)
{
    return TP.Controller.extend(
    {
        views: {},
        
        initialize: function(options)
        {
            _.bindAll(this);

            this.layout = new NavigationLayout();

            this.views.userControlsView = new UserControlsView({ model: theSession });
            this.views.navigationView = new NavigationView();
        },
        
        show: function()
        {
            this.layout.userRegion.show(this.views.userControlsView);
            this.layout.navigationRegion.show(this.views.navigationView);
        }
    });
});
