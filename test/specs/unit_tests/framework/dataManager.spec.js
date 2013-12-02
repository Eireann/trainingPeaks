define([
    "jquery",
    "backbone",
    "TP", 
    "framework/dataManager"
],
function(
    $,
    Backbone,
    TP,
    DataManager
) {

    describe("Data Manager", function()
    {
        var dataManager;

        var FakeModel = TP.Model.extend({
            url: "fakeModelUrl",
            initialize: function(attributes, options)
            {
                this.requestSignature = options && options.requestSignature;
            },
            fetch: function(options)
            {
                this.fetchOptions = options;
            },
            resolve: function(data, options)
            {
                this.fetchOptions.success(this, data, options);
            },
            reject: function(data, options)
            {
                this.fetchOptions.error(this, data, options);
            }
        });

        beforeEach(function()
        {
            dataManager = new DataManager({
                resetPatterns: [/resetme/i],
                ignoreResetPatterns: [/ignoreme/i]
            });
        });

        describe("Load Model", function()
        {

            it("Should resolve a request when the source request resolves", function()
            {
                var deferred = dataManager.loadModel(FakeModel);
                var fakeModel = deferred.model;
                expect(deferred.state()).to.equal("pending");
                fakeModel.resolve({ valueOne: "hello", valueTwo: "world" });
                expect(deferred.state()).to.equal("resolved");
                expect(fakeModel.get("valueOne")).to.equal("hello");
                expect(fakeModel.get("valueTwo")).to.equal("world");
            });

            it("Should reject a request when the source request fails", function()
            {
                var deferred = dataManager.loadModel(FakeModel);
                expect(deferred.state()).to.equal("pending");
                deferred.model.reject();
                expect(deferred.state()).to.equal("rejected");
            });

            it("Should return a common model instance", function()
            {
                var deferredOne = dataManager.loadModel(FakeModel);
                var deferredTwo = dataManager.loadModel(FakeModel);
                var fakeModelOne = deferredOne.model;
                var fakeModelTwo = deferredTwo.model;

                expect(fakeModelOne).to.eql(fakeModelTwo);

                fakeModelOne.resolve({ valueOne: "hello", valueTwo: "world" });

                expect(deferredOne.state()).to.equal("resolved");
                expect(deferredTwo.state()).to.equal("resolved");
                expect(fakeModelTwo.get("valueOne")).to.equal("hello");
                expect(fakeModelTwo.get("valueTwo")).to.equal("world");
            });

            it("Should resolve new request with previously resolved data", function()
            {
                var deferredOne = dataManager.loadModel(FakeModel);
                var fakeModelOne = deferredOne.model;

                expect(deferredOne.state()).to.equal("pending");
                fakeModelOne.resolve({ valueOne: "hello", valueTwo: "world" });
                expect(deferredOne.state()).to.equal("resolved");

                var deferredTwo = dataManager.loadModel(FakeModel);
                var fakeModelTwo = deferredTwo.model;
                expect(deferredTwo.state()).to.equal("resolved");
                expect(fakeModelTwo.get("valueOne")).to.equal("hello");
                expect(fakeModelTwo.get("valueTwo")).to.equal("world");
            });

        });

        describe("Reset", function()
        {

            it("Should reset when a matching model is saved", function()
            {
                var saveModelUrl = "/fitness/v1/resetme/";
                var resetSpy = sinon.stub();
                dataManager.on("reset", resetSpy);
                dataManager.reset(saveModelUrl); 

                expect(resetSpy).to.have.been.called;
            });

            it("Should not reset when a non matching model is saved", function()
            {
                var saveModelUrl = "/fitness/v1/idontmatch/";
                var resetSpy = sinon.stub();
                dataManager.on("reset", resetSpy);
                dataManager.reset(saveModelUrl);
                
                expect(resetSpy).to.not.have.been.called;
            });

            it("Should not reset when an ignoreable model is saved", function()
            {
                var saveModelUrl = "/fitness/v1/resetme/ignoreme/";
                var resetSpy = sinon.stub();
                dataManager.on("reset", resetSpy);
                dataManager.reset(saveModelUrl);
                
                expect(resetSpy).to.not.have.been.called;
            });

        });

        describe("Fetch ajax", function()
        {
            it("Should resolve a request when the source request resolves", function()
            {
                var ajaxDeferred = new $.Deferred();
                sinon.stub(Backbone, "ajax", function(options){
                    options.deferred = ajaxDeferred;
                    return options.deferred;
                });

                var resolvedData = null;
                var dataManagerDeferred = dataManager.fetchAjax("requestSignature", { url: "requestSignature", type: "GET", data: "" });
                expect(dataManagerDeferred.state()).to.equal("pending");

                dataManagerDeferred.done(function(data){ resolvedData = data; });

                var results = { valueOne: "hello", valueTwo: "world" };
                ajaxDeferred.resolve(results);
                expect(dataManagerDeferred.state()).to.equal("resolved");
                expect(resolvedData).to.equal(results);
            });

            it("Should resolve multiple pending requests with the same data", function()
            {
                sinon.stub(Backbone, "ajax", function(options){
                    options.deferred = new $.Deferred();
                    return options.deferred;
                });

                var optionsOne = { url: "requestSignature", type: "GET", data: "" };
                var optionsTwo = { url: "requestSignature", type: "POST", data: "nothing" };
                var dataManagerDeferredOne = dataManager.fetchAjax("requestSignature", optionsOne);
                var dataManagerDeferredTwo = dataManager.fetchAjax("requestSignature", optionsTwo);
                expect(dataManagerDeferredOne.state()).to.equal("pending");
                expect(dataManagerDeferredTwo.state()).to.equal("pending");

                dataManagerDeferredOne.done(function(data){ optionsOne.resolvedData = data; });
                dataManagerDeferredTwo.done(function(data){ optionsTwo.resolvedData = data; });

                var results = { valueOne: "hello", valueTwo: "world" };

                optionsOne.deferred.resolve(results);
                expect(dataManagerDeferredOne.state()).to.equal("resolved");
                expect(optionsOne.resolvedData).to.equal(results);

                expect(dataManagerDeferredTwo.state()).to.equal("resolved");
                expect(optionsTwo.resolvedData).to.equal(results);
            });

            it("Should resolve new request with previously resolved data", function()
            {
                sinon.stub(Backbone, "ajax", function(options){
                    options.deferred = new $.Deferred();
                    return options.deferred;
                });

                var optionsOne = { url: "requestSignature", type: "GET", data: "" };
                var dataManagerDeferredOne = dataManager.fetchAjax("requestSignature", optionsOne);
                expect(dataManagerDeferredOne.state()).to.equal("pending");
                dataManagerDeferredOne.done(function(data){ optionsOne.resolvedData = data; });

                var results = { valueOne: "hello", valueTwo: "world" };
                optionsOne.deferred.resolve(results);
                expect(dataManagerDeferredOne.state()).to.equal("resolved");
                expect(optionsOne.resolvedData).to.equal(results);

                var optionsTwo = { url: "requestSignature", type: "POST", data: "nothing" };
                var dataManagerDeferredTwo = dataManager.fetchAjax("requestSignature", optionsTwo);
                expect(dataManagerDeferredTwo.state()).to.equal("resolved");
                dataManagerDeferredTwo.done(function(data){ optionsTwo.resolvedData = data; });
                expect(optionsTwo.resolvedData).to.equal(results);

            });
        });

    });

});
