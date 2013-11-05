define(
[
    "jquery",
    "TP",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "shared/views/userSettingsView"
],
function(
    $,
    TP,
    testHelpers,
    xhrData,
    UserSettingsView
)
{
    describe("User Settings View", function()
    {
        var selectBoxIt = $.fn.selectBoxIt;
        beforeEach(function()
        {
            var userData = xhrData.users.barbkprem;
            testHelpers.startTheAppAndLogin(testHelpers.deepClone(userData));
            sinon.stub($.fn, 'selectBoxIt'); // selectBoxIt freezes...
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
            $.fn.selectBoxIt = selectBoxIt;
        });

        it("Should load successfully as a module", function()
        {
            expect(UserSettingsView).to.not.be.undefined;
        });

        it("Should not throw durring lifecycle calls", function()
        {
            var view = new UserSettingsView({ model: testHelpers.theApp.user });
            view.render();
            view.close();
        });

        it("Should preserve values when switching tabs", function()
        {
            testHelpers.theApp.user.set("address", "Original Address");
            var view = new UserSettingsView({ model: testHelpers.theApp.user });
            view.render();

            expect(view.$("input[name=address]").length).to.equal(1);
            expect(view.$("input[name=address]").val()).to.equal("Original Address");
            view.$("input[name=address]").val("New Address").trigger("change");
            expect(view.$("input[name=address]").val()).to.equal("New Address");

            view.$(".tabbedLayoutNav > li:not(.active):first .tabbedLayoutNavLink").trigger("click");
            expect(view.$("input[name=address]").length).to.equal(0);

            view.$(".tabbedLayoutNav > li:not(.active):first .tabbedLayoutNavLink").trigger("click");
            expect(view.$("input[name=address]").length).to.equal(1);
            expect(view.$("input[name=address]").val()).to.equal("New Address");
            view.close();
        });

        it("Should apply values to original models on save", function()
        {
            testHelpers.theApp.user.set("address", "Original Address");
            var view = new UserSettingsView({ model: testHelpers.theApp.user });
            view.render();

            view.$("input[name=address]").val("New Address").trigger("change");
            expect(testHelpers.theApp.user.get("address")).to.equal("Original Address");
            view.$("button.save").trigger("click");
            expect(testHelpers.theApp.user.get("address")).to.equal("New Address");

            view.close();
        });

        it("Should not apply values to original models on cancel", function()
        {
            testHelpers.theApp.user.set("address", "Original Address");
            var view = new UserSettingsView({ model: testHelpers.theApp.user });
            view.render();

            view.$("input[name=address]").val("New Address").trigger("change");
            expect(testHelpers.theApp.user.get("address")).to.equal("Original Address");
            view.$("button.cancel").trigger("click");
            expect(testHelpers.theApp.user.get("address")).to.equal("Original Address");

        });

        it("Should not apply values to original models on switching tabs", function()
        {
            testHelpers.theApp.user.set("address", "Original Address");
            var view = new UserSettingsView({ model: testHelpers.theApp.user });
            view.render();

            view.$("input[name=address]").val("New Address").trigger("change");
            view.$(".tabbedLayoutNav > li:not(.active):first .tabbedLayoutNavLink").trigger("click");
            view.$(".tabbedLayoutNav > li:not(.active):first .tabbedLayoutNavLink").trigger("click");
            expect(testHelpers.theApp.user.get("address")).to.equal("Original Address");
        });

    });

});

