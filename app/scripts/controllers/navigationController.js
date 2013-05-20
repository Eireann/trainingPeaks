define(
[
    "TP",
    "layouts/navigationLayout",
    "views/userControls/userControlsView",
    "views/navigationView"
],
function(TP, NavigationLayout, UserControlsView, NavigationView)
{
    return TP.Controller.extend(
    {
        views: {},
        
        initialize: function()
        {
            this.layout = new NavigationLayout();
            this.layout.on("show", this.show, this);

            this.views.userControlsView = new UserControlsView({ model: theMarsApp.user });
            this.views.navigationView = new NavigationView();
        },
        
        show: function()
        {
            this.layout.userRegion.show(this.views.userControlsView);
            this.layout.navigationRegion.show(this.views.navigationView);
        },

        onClose: function()
        {
            this.layout.close();
            this.views.userControlsView.close();
            this.views.navigationView.close();
        }
    });
});
