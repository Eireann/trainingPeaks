define(
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
            expect(UserControlsView).to.not.be.undefined;
        });

        xit("Renders the UserSettings view when the usernameLabel is clicked (TODO: fix or remove)", function()
        {
            var view = new UserControlsView({ model: new UserModel() });
            view.$("#userName").trigger("click");
        });
    });
});
