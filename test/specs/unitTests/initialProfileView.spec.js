define(
[
    "underscore",
    "jquery",
    "TP",
    "shared/models/userModel",
    "shared/models/athleteSettingsModel",
    "shared/views/initialProfileView",
    "shared/views/userSettingsView",
    "testUtils/xhrDataStubs"
],
function(
    _,
    $,
    TP,
    UserModel,
    AthleteSettingsModel, 
    InitialProfileView,
    UserSettingsView,
    xhrData
    ) 
{
    describe("Initial Profile View", function()
    {

        var view;
        beforeEach(function()
        {
            var userModel = new UserModel(xhrData.users.barbkprem);
            userModel.setCurrentAthlete(new AthleteSettingsModel(xhrData.users.barbkprem.athletes[0]));

            view = new InitialProfileView({
                userModel: userModel,
                analytics: function(){},
                timeZones: [],
                calendarManager: {
                    reset: function(){}
                }
            });

            view.render();
        });

        afterEach(function()
        {
            view.close();
        });

        describe("Save", function()
        {
            /*
            var userPromise = this._saveUserModel();
            var profilePromise = this._saveProfileData();

            profilePromise.then(function()
            {
                var xhr = this._fetchAthleteSettings();
                xhr.then(athleteDeferred.resolve, athleteDeferred.reject);
            });

            return $.when(profilePromise, userPromise, athleteDeferred.promise()).then(function()
            {
                if(self.$("#interestedIn"))
                {
                    var interestedIn = self.$("#interestedIn").val();
                    self.analytics("send", { "hitType": "event", "eventCategory": "persona", "eventAction": "submitProfile", "eventLabel": interestedIn });
                }

                self.calendarManager.reset();
                self.close();
            });

            */

            it("Should save the user", function()
            {
                sinon.spy(view.userModel, "save");
                view.$("input[name=submit]").trigger("click");
                expect(view.userModel.save).to.have.been.called;
            });

            it("Should save the profile data", function()
            {
                sinon.spy(view, "_saveProfileData");
                view.$("input[name=submit]").trigger("click");
                expect(view._saveProfileData).to.have.been.called;
            });

            it("Should reload the athlete settings", function()
            {
                sinon.stub(view, "_saveProfileData").returns(new $.Deferred().resolve());
                sinon.spy(view.userModel.getAthleteSettings(), "fetch");
                view.$("input[name=submit]").trigger("click");
                expect(view.userModel.getAthleteSettings().fetch).to.have.been.called;
            });

            it("Should trigger an analytics event", function()
            {
                sinon.spy(view, "analytics");
                sinon.stub(view, "_saveUserModel").returns(new $.Deferred().resolve());
                sinon.stub(view, "_saveProfileData").returns(new $.Deferred().resolve());
                sinon.stub(view.userModel.getAthleteSettings(), "fetch").returns(new $.Deferred().resolve());
                view.$("input[name=submit]").trigger("click");
                expect(view.analytics).to.have.been.called;
            });

            it("Should reset the calendar manager", function()
            {
                sinon.spy(view.calendarManager, "reset");
                sinon.stub(view, "_saveUserModel").returns(new $.Deferred().resolve());
                sinon.stub(view, "_saveProfileData").returns(new $.Deferred().resolve());
                sinon.stub(view.userModel.getAthleteSettings(), "fetch").returns(new $.Deferred().resolve());
                view.$("input[name=submit]").trigger("click");
                expect(view.calendarManager.reset).to.have.been.called;
            });
        });

        describe("Account Settings", function()
        {
            it("Should open the user account settings view", function()
            {
                sinon.stub(UserSettingsView.prototype, "render");
                view.$(".accountSettings").trigger("click");
                expect(UserSettingsView.prototype.render).to.have.been.called;
            });
        });

    });

});
