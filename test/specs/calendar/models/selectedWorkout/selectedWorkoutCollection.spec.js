// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "underscore",
    "app",
    "TP",
    "models/selectedWorkoutCollection"
],
function (testHelpers, xhrData, _, app, TP, SelectedWorkoutCollection)
{
    describe("SelectedWorkoutCollection", function()
    {

        beforeEach(function ()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
        });

        afterEach(function ()
        {
            testHelpers.stopTheApp();
        });
        
        describe("Delete Workouts", function()
        {
            it("should trigger a request on each model.", function ()
            {

                var models = [new TP.Model({ id: 55555 }), new TP.Model({ id: 44444 })];
                var collection = new SelectedWorkoutCollection(models);

                _.each(models, function(item, index)
                {
                    spyOn(item, "trigger");
                }, this);

                collection.deleteWorkouts();
                
                _.each(models, function (item, index)
                {
                    expect(item.trigger).toHaveBeenCalledWith('request', item, item.collection);
                    expect(item.trigger).not.toHaveBeenCalledWith('destroy', item, item.collection);
                }, this);
            });

            it("should call a delete on the appropriate url", function()
            {
                var models = [new TP.Model({ id: 55555 }), new TP.Model({ id: 44444 })];
                var collection = new SelectedWorkoutCollection(models);

                collection.deleteWorkouts();
                expect(testHelpers.hasRequest(null,"55555,44444")).toBe(true);
            });
            
            it("should trigger destory", function ()
            {
                var models = [new TP.Model({ id: 55555 }), new TP.Model({ id: 44444 })];
                var collection = new SelectedWorkoutCollection(models);

                _.each(models, function (item, index)
                {
                    spyOn(item, "trigger");
                }, this);

                collection.deleteWorkouts();

                testHelpers.resolveRequest(null, "55555,44444", {});
                
                _.each(models, function (item, index)
                {
                    expect(item.trigger).toHaveBeenCalledWith('destroy', item, item.collection);
                }, this);
            });
        });
    });
});