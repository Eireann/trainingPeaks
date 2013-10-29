// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[ 
    "jquery",
    "backbone",
    "shared/models/userModel",
    "views/userControls/userControlsView"
],
function ($, Backbone, UserModel, UserControlsView)
{
    describe("UserControls View", function ()
    {
        beforeEach(function ()
        {
        });

        it("Loads as a module", function()
        {
            expect(UserControlsView).toBeDefined();
        });

        xit("Renders the UserSettings view when the usernameLabel is clicked", function()
        {
            var view = new UserControlsView({ model: new UserModel() });
            view.$("#userName").trigger("click");
        });
    });
});
