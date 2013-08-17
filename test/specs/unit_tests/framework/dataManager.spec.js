requirejs([
    "TP",
    "framework/dataManager"
],
function(
    TP,
    DataManager
) {

    describe("Data Manager", function()
    {
        var dataManager;

        var FakeModel = TP.Model.extend({
            url: "fakeModelUrl",
            fetch: function(options)
            {
                this.fetchOptions = options;
            },
            resolve: function(data, options)
            {
                this.fetchOptions.success(this, data, options);
            }
        });

        beforeEach(function()
        {
            dataManager = new DataManager({
                resetPatterns: [/resetme/i],
                ignoreResetPatterns: [/ignoreme/i]
            });
        });

        it("Should resolve a request when the source request resolves", function()
        {
            var fakeModel = new FakeModel();
            var deferred = dataManager.fetchOnModel(fakeModel);
            expect(deferred.state()).toBe("pending");
            fakeModel.resolve({ valueOne: "hello", valueTwo: "world" });
            expect(deferred.state()).toBe("resolved");
            expect(fakeModel.get("valueOne")).toBe("hello");
            expect(fakeModel.get("valueTwo")).toBe("world");
        });

        it("Should resolve multiple pending requests with the same data", function()
        {
            var fakeModelOne = new FakeModel();
            var fakeModelTwo = new FakeModel();
            var deferredOne = dataManager.fetchOnModel(fakeModelOne);
            var deferredTwo = dataManager.fetchOnModel(fakeModelTwo);
            expect(deferredOne.state()).toBe("pending");
            expect(deferredTwo.state()).toBe("pending");

            fakeModelOne.resolve({ valueOne: "hello", valueTwo: "world" });

            expect(deferredOne.state()).toBe("resolved");
            expect(deferredTwo.state()).toBe("resolved");
            expect(fakeModelTwo.get("valueOne")).toBe("hello");
            expect(fakeModelTwo.get("valueTwo")).toBe("world");
        });

        it("Should resolve new request with previously resolved data", function()
        {
            var fakeModelOne = new FakeModel();
            var deferredOne = dataManager.fetchOnModel(fakeModelOne);
            expect(deferredOne.state()).toBe("pending");
            fakeModelOne.resolve({ valueOne: "hello", valueTwo: "world" });
            expect(deferredOne.state()).toBe("resolved");

            var fakeModelTwo = new FakeModel();
            var deferredTwo = dataManager.fetchOnModel(fakeModelTwo);
            expect(deferredTwo.state()).toBe("resolved");
            expect(fakeModelTwo.get("valueOne")).toBe("hello");
            expect(fakeModelTwo.get("valueTwo")).toBe("world");
        });

        it("Should reset when a matching model is saved", function()
        {
            var saveModelUrl = "/fitness/v1/resetme/something/";
            var fakeModelOne = new FakeModel();
            dataManager.fetchOnModel(fakeModelOne);
            fakeModelOne.resolve({ valueOne: "hello", valueTwo: "world" });

            dataManager.reset(saveModelUrl); 
            var fakeModelTwo = new FakeModel();
            var deferredTwo = dataManager.fetchOnModel(fakeModelTwo);
            expect(deferredTwo.state()).toBe("pending");
        });

        it("Should not reset when a non matching model is saved", function()
        {
            var saveModelUrl = "/fitness/v1/idontmatch/";
            var fakeModelOne = new FakeModel();
            dataManager.fetchOnModel(fakeModelOne);
            fakeModelOne.resolve({ valueOne: "hello", valueTwo: "world" });

            dataManager.reset(saveModelUrl); 
            var fakeModelTwo = new FakeModel();
            var deferredTwo = dataManager.fetchOnModel(fakeModelTwo);
            expect(deferredTwo.state()).toBe("resolved");
        });

        it("Should not reset when an ignoreable model is saved", function()
        {
            var saveModelUrl = "/fitness/v1/resetme/ignoreme/";
            var fakeModelOne = new FakeModel();
            dataManager.fetchOnModel(fakeModelOne);
            fakeModelOne.resolve({ valueOne: "hello", valueTwo: "world" });

            dataManager.reset(saveModelUrl); 
            var fakeModelTwo = new FakeModel();
            var deferredTwo = dataManager.fetchOnModel(fakeModelTwo);
            expect(deferredTwo.state()).toBe("resolved");
        });

        describe("Post requests", function()
        {
            it("Should use the requestSignature attribute or method if it exists", function()
            {
                var fakeModelWithRegularUrl = new FakeModel();
                var fakeModelWithRequestSignature = new FakeModel();
                fakeModelWithRequestSignature.requestSignature = "iamanonstandardrequest";

                var deferredOne = dataManager.fetchOnModel(fakeModelWithRegularUrl);
                var deferredTwo = dataManager.fetchOnModel(fakeModelWithRequestSignature);
                fakeModelWithRegularUrl.resolve({ something: "string" });
                expect(deferredOne.state()).toBe("resolved");
                expect(deferredTwo.state()).toBe("pending");
            });
        });
    });

});