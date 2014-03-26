define(
[
    "jquery",
    "shared/models/userModel",
    "shared/models/athleteSettingsModel",
    "shared/views/userSettingsView",
    "views/userControls/accountMenuView",
    "testUtils/xhrDataStubs"
],
function(
    $,
    UserModel,
    AthleteSettingsModel,
    UserSettingsView,
    AccountMenuView,
    xhrData
    ) 
{
    describe("Account Menu View", function()
    {

        var userModel, view;
        beforeEach(function()
        {
            sinon.stub(UserSettingsView.prototype, "render");

            userModel = new UserModel(xhrData.users.barkprem);
            userModel.setCurrentAthlete(new AthleteSettingsModel(xhrData.athleteSettings.barbkprem));

            sinon.stub(userModel, "fetch").returns(new $.Deferred());
            sinon.stub(userModel.getAthleteSettings(), "fetch").returns(new $.Deferred());

            view = new AccountMenuView({ model: userModel });
            view.render();
        });

        describe("openUserSettings", function()
        {

            it("Should refresh user data from the server before opening the user settings view", function()
            {
                view.$("#accountMenuUserSettings").trigger("click");
                expect(userModel.fetch).to.have.been.called;
                expect(UserSettingsView.prototype.render).to.not.have.been.called;
            });

            it("Should render user settings view once fetch returns", function()
            {
                userModel.fetch.returns(new $.Deferred().resolve());
                userModel.getAthleteSettings().fetch.returns(new $.Deferred().resolve());
                view.$("#accountMenuUserSettings").trigger("click");
                expect(userModel.fetch).to.have.been.called;
                expect(UserSettingsView.prototype.render).to.have.been.called;
            });
        });

    });

});
