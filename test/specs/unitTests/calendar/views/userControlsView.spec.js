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

        it("Uses the first/last name for the full name when available", function()
        {
            var user, view;

            user = new UserModel({ firstName: "First" });
            view = new UserControlsView({ model: user });
            expect(view.serializeData().fullName).to.equal("First");

            user = new UserModel({ lastName: "Last" });
            view = new UserControlsView({ model: user });
            expect(view.serializeData().fullName).to.equal("Last");

            user = new UserModel({ firstName: "First", lastName: "Last" });
            view = new UserControlsView({ model: user });
            expect(view.serializeData().fullName).to.equal("First Last");
        });

        it("Uses the userName for the full name when there is no first/last name", function()
        {
            var user, view;

            user = new UserModel({ userName: "User" });
            view = new UserControlsView({ model: user });
            expect(view.serializeData().fullName).to.equal("User");

            user = new UserModel({ firstName: "", lastName: "", userName: "User" });
            view = new UserControlsView({ model: user });
            expect(view.serializeData().fullName).to.equal("User");
        });

        xit("Renders the UserSettings view when the usernameLabel is clicked (TODO: fix or remove)", function()
        {
            var view = new UserControlsView({ model: new UserModel() });
            view.$("#userName").trigger("click");
        });
    });
});
