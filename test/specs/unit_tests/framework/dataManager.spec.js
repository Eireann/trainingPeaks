requirejs([
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
                expect(deferred.state()).toBe("pending");
                fakeModel.resolve({ valueOne: "hello", valueTwo: "world" });
                expect(deferred.state()).toBe("resolved");
                expect(fakeModel.get("valueOne")).toBe("hello");
                expect(fakeModel.get("valueTwo")).toBe("world");
            });

            it("Should return a common model instance", function()
            {
                var deferredOne = dataManager.loadModel(FakeModel);
                var deferredTwo = dataManager.loadModel(FakeModel);
                var fakeModelOne = deferredOne.model;
                var fakeModelTwo = deferredTwo.model;

                expect(fakeModelOne).toEqual(fakeModelTwo);

                fakeModelOne.resolve({ valueOne: "hello", valueTwo: "world" });

                expect(deferredOne.state()).toBe("resolved");
                expect(deferredTwo.state()).toBe("resolved");
                expect(fakeModelTwo.get("valueOne")).toBe("hello");
                expect(fakeModelTwo.get("valueTwo")).toBe("world");
            });

            it("Should resolve new request with previously resolved data", function()
            {
                var deferredOne = dataManager.loadModel(FakeModel);
                var fakeModelOne = deferredOne.model;

                expect(deferredOne.state()).toBe("pending");
                fakeModelOne.resolve({ valueOne: "hello", valueTwo: "world" });
                expect(deferredOne.state()).toBe("resolved");

                var deferredTwo = dataManager.loadModel(FakeModel);
                var fakeModelTwo = deferredTwo.model;
                expect(deferredTwo.state()).toBe("resolved");
                expect(fakeModelTwo.get("valueOne")).toBe("hello");
                expect(fakeModelTwo.get("valueTwo")).toBe("world");
            });

        });

        describe("Reset", function()
        {

            it("Should reset when a matching model is saved", function()
            {
                var saveModelUrl = "/fitness/v1/resetme/";
                var resetSpy = jasmine.createSpy();
                dataManager.on("reset", resetSpy);
                dataManager.reset(saveModelUrl); 

                expect(resetSpy).toHaveBeenCalled();
            });

            it("Should not reset when a non matching model is saved", function()
            {
                var saveModelUrl = "/fitness/v1/idontmatch/";
                var resetSpy = jasmine.createSpy();
                dataManager.on("reset", resetSpy);
                dataManager.reset(saveModelUrl);
                
                expect(resetSpy).not.toHaveBeenCalled();
            });

            it("Should not reset when an ignoreable model is saved", function()
            {
                var saveModelUrl = "/fitness/v1/resetme/ignoreme/";
                var resetSpy = jasmine.createSpy();
                dataManager.on("reset", resetSpy);
                dataManager.reset(saveModelUrl);
                
                expect(resetSpy).not.toHaveBeenCalled();
            });

        });

        describe("Fetch ajax", function()
        {
            it("Should resolve a request when the source request resolves", function()
            {
                var ajaxDeferred = new $.Deferred();
                spyOn(Backbone, "ajax").andCallFake(function(options){
                    options.deferred = ajaxDeferred;
                    return options.deferred;
                });

                var resolvedData = null;
                var dataManagerDeferred = dataManager.fetchAjax("requestSignature", { url: "requestSignature", type: "GET", data: "" });
                expect(dataManagerDeferred.state()).toBe("pending");

                dataManagerDeferred.done(function(data){ resolvedData = data; });

                var results = { valueOne: "hello", valueTwo: "world" };
                ajaxDeferred.resolve(results);
                expect(dataManagerDeferred.state()).toBe("resolved");
                expect(resolvedData).toBe(results);
            });

            it("Should resolve multiple pending requests with the same data", function()
            {
                spyOn(Backbone, "ajax").andCallFake(function(options){
                    options.deferred = new $.Deferred();
                    return options.deferred;
                });

                var optionsOne = { url: "requestSignature", type: "GET", data: "" };
                var optionsTwo = { url: "requestSignature", type: "POST", data: "nothing" };
                var dataManagerDeferredOne = dataManager.fetchAjax("requestSignature", optionsOne);
                var dataManagerDeferredTwo = dataManager.fetchAjax("requestSignature", optionsTwo);
                expect(dataManagerDeferredOne.state()).toBe("pending");
                expect(dataManagerDeferredTwo.state()).toBe("pending");

                dataManagerDeferredOne.done(function(data){ optionsOne.resolvedData = data; });
                dataManagerDeferredTwo.done(function(data){ optionsTwo.resolvedData = data; });

                var results = { valueOne: "hello", valueTwo: "world" };

                optionsOne.deferred.resolve(results);
                expect(dataManagerDeferredOne.state()).toBe("resolved");
                expect(optionsOne.resolvedData).toBe(results);

                expect(dataManagerDeferredTwo.state()).toBe("resolved");
                expect(optionsTwo.resolvedData).toBe(results);
            });

            it("Should resolve new request with previously resolved data", function()
            {
                spyOn(Backbone, "ajax").andCallFake(function(options){
                    options.deferred = new $.Deferred();
                    return options.deferred;
                });

                var optionsOne = { url: "requestSignature", type: "GET", data: "" };
                var dataManagerDeferredOne = dataManager.fetchAjax("requestSignature", optionsOne);
                expect(dataManagerDeferredOne.state()).toBe("pending");
                dataManagerDeferredOne.done(function(data){ optionsOne.resolvedData = data; });

                var results = { valueOne: "hello", valueTwo: "world" };
                optionsOne.deferred.resolve(results);
                expect(dataManagerDeferredOne.state()).toBe("resolved");
                expect(optionsOne.resolvedData).toBe(results);

                var optionsTwo = { url: "requestSignature", type: "POST", data: "nothing" };
                var dataManagerDeferredTwo = dataManager.fetchAjax("requestSignature", optionsTwo);
                expect(dataManagerDeferredTwo.state()).toBe("resolved");
                dataManagerDeferredTwo.done(function(data){ optionsTwo.resolvedData = data; });
                expect(optionsTwo.resolvedData).toBe(results);

            });
        });

    });

});
