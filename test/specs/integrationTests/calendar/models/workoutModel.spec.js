define(
    [
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "moment",
    "jquery",
    "backbone",
    "models/workoutModel"],
function(
    testHelpers,
    xhrData,
    moment,
    $,
    Backbone,
    WorkoutModel)
{
    describe("Workout Model", function()
    {

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        describe("duplicate save protection", function()
        {
            it("Should not save multiple copies", function()
            {
                var model = new WorkoutModel();
                model.autosave({});
                model.autosave({});

                var requests = testHelpers.findAllRequests("POST", "/workouts");
                expect(requests).to.have.length(1);

                testHelpers.resolveRequest("POST", "/workouts", { workoutId: 42 });

                requests = testHelpers.findAllRequests("POST", "/workouts");
                expect(requests).to.have.length(1);

                requests = testHelpers.findAllRequests("PUT", "/workouts/42");
                expect(requests).to.have.length(1);
            });
            
            it("Should start delayed saves on failures", function()
            {
                var model = new WorkoutModel();
                model.autosave({});
                model.autosave({});

                var requests = testHelpers.findAllRequests("POST", "/workouts");
                expect(requests).to.have.length(1);

                testHelpers.rejectRequest("POST", "/workouts");

                requests = testHelpers.findAllRequests("POST", "/workouts");
                expect(requests).to.have.length(2);
            });

            it("Should sequence saves", function()
            {
                var model = new WorkoutModel({ workoutId: 42 });
                model.autosave({});
                model.autosave({});

                var requests = testHelpers.findAllRequests("PUT", "/workouts");
                expect(requests).to.have.length(1);

                testHelpers.resolveRequest("PUT", "/workouts", { workoutId: 42 });

                requests = testHelpers.findAllRequests("PUT", "/workouts");
                expect(requests).to.have.length(2);
            });

            it("Should merge save results and local changes", function()
            {
                var model = new WorkoutModel({ workoutId: 42, title: "original", description: "original" });

                model.autosave({});

                model.set({ title: "local" });

                var requests = testHelpers.findAllRequests("PUT", "/workouts");
                expect(requests).to.have.length(1);

                testHelpers.resolveRequest("PUT", "/workouts", { workoutId: 42, title: "server", description: "server" });

                expect(model.get("title")).to.equal("local");
                expect(model.get("description")).to.equal("server");
            });
        });

    });

});
