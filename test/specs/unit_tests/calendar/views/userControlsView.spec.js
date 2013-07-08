// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "jquery",
    "backbone",
    "views/userControls/userControlsView"
],
function ($, Backbone, UserControlsView)
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

        it("Renders the UserSettings view when the usernameLabel is clicked", function()
        {
            var view = new UserControlsView();

            view.$("#usernameLabel").click();
        });
    });
});