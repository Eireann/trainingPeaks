describe("Login View", function ()
{

    it("Should test the Login View", function (done)
    {

        // use requirejs() instead of define() here, to keep jasmine test runner happy
        requirejs(
        [
            "jquery",
            "backbone",
            "views/loginView"
        ],
        function ($, Backbone, loginView)
        {
            describe("Login View", function ()
            {
                beforeEach(function ()
                {
                });

                it("requires a session model at construction", function()
                {
                    var fakeSessionModel = new Backbone.Model();
                    
                    expect(function() { var tmp = new loginView(); }).toThrow();
                    expect(function() { var tmp = new loginView({ model: fakeSessionModel }); }).not.toThrow();
                });

                it("subscribes to the model's success & failure events", function()
                {
                    var fakeSessionModel = new Backbone.Model();
                    
                    spyOn(loginView.prototype, "onLoginSuccess");
                    spyOn(loginView.prototype, "onLoginFailure");

                    spyOn(fakeSessionModel, "on").andCallThrough();

                    var view = new loginView({ model: fakeSessionModel });

                    expect(fakeSessionModel.on).toHaveBeenCalledWith("api:authorization:success", view.onLoginSuccess);
                    expect(fakeSessionModel.on).toHaveBeenCalledWith("api:authorization:failure", view.onLoginFailure);

                    fakeSessionModel.trigger("api:authorization:failure");

                    expect(loginView.prototype.onLoginSuccess).not.toHaveBeenCalled();
                    expect(loginView.prototype.onLoginFailure).toHaveBeenCalled();

                    fakeSessionModel.trigger("api:authorization:success");
                    expect(loginView.prototype.onLoginSuccess).toHaveBeenCalled();
                });

                it("triggers a login:success event when the model successfully authenticates", function()
                {
                    var fakeSessionModel = new Backbone.Model();
                    var view = new loginView({ model: fakeSessionModel });
                    var fakeController =
                    {
                        fakeSuccessHandler: function()
                        {
                        }
                    };
                    spyOn(fakeController, "fakeSuccessHandler");
                    view.on("login:success", fakeController.fakeSuccessHandler);
                    fakeSessionModel.trigger("api:authorization:success");
                    expect(fakeController.fakeSuccessHandler).toHaveBeenCalled();
                });
            });

            done();
        });

    });
});