define(
[
    "jquery",
    "backbone",
    "shared/models/userModel"
],
function(
    $,
    Backbone,
    UserModel
    ) 
{
    describe("User Model", function()
    {

        var userModel, fetchDeferred, localStorage;
        beforeEach(function()
        {
            fetchDeferred = new $.Deferred();

            sinon.stub(Backbone, "ajax").returns(fetchDeferred);

            localStorage = {
                getItem: sinon.stub(),
                setItem: sinon.stub(),
                removeItem: sinon.stub()
            };

            userModel = new UserModel({ localStorage: localStorage });
        });

        describe("fetch", function()
        {

            it("Should populate model with data from local cache if it exists", function()
            {
                var cachedData = { userName: "userFromCache", settings: {}};
                localStorage.getItem.returns(cachedData);
                var promise = userModel.fetch();

                expect(userModel.get("userName")).to.eql("userFromCache");
                expect(promise.state()).to.eql("resolved");
            });

            it("Should request data from server", function()
            {
                var promise = userModel.fetch();
                expect(Backbone.ajax).to.have.been.calledOnce;
            });

            it("Should save server response to local cache", function()
            {
                userModel.fetch();

                var serverData = { userName: "userFromServer", settings: {}};
                fetchDeferred.resolve(serverData);

                expect(localStorage.setItem).to.have.been.calledWith("app_user");
            });

            it("Should respect nocache option", function()
            {
                var cachedData = { userName: "userFromCache", settings: {}};
                localStorage.getItem.returns(cachedData);
                var promise = userModel.fetch({ nocache: true });

                expect(userModel.get("userName")).to.not.eql("userFromCache");
                expect(promise.state()).to.eql("pending");
            });

            it("Should remove user from local storage if logged in as different user", function()
            {
                var cachedData = { userName: "userFromCache", settings: {}};
                localStorage.getItem.returns(cachedData);

                userModel.fetch({ user: "someOtherUser" });
                expect(userModel.get("userName")).to.not.eql("userFromCache");
                expect(localStorage.removeItem).to.have.been.calledOnce;
            });

        });

    });

});
