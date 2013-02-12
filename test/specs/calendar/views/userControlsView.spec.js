// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "jquery",
    "backbone",
    "views/userControlsView"
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

        it("Registers UI elements onto its context", function()
        {
            var view = new UserControlsView();
            expect(view.ui.settingsButton).toBeDefined();
            expect(view.ui.settingsWrapper).toBeDefined();
        });

        it("Renders the UserSettings view when the usernameLabel is clicked", function()
        {
            var view = new UserControlsView();

            view.$("#usernameLabel").click();
        });
    });
});