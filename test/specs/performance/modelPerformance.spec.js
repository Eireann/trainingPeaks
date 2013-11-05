define(
[
    "moment",
    "backbone",
    "backbone.deepmodel",
    "TP",
    "models/workoutModel",
    "models/workoutDetailData",
    "models/workoutsCollection",
    "testUtils/AppTestData/GET_DetailData_134283074",
    "testUtils/AppTestData/GET_Workouts_2013_06_17_2013_06_23",
    "testUtils/AppTestData/singleWorkout"
],
function(
    moment,
    Backbone,
    BackboneDeepModel,
    TP,
    WorkoutModel,
    WorkoutDetailDataModel,
    WorkoutsCollection,
    DetailDataJSON,
    WorkoutCollectionJSON,
    SingleWorkoutJSON
    )
{

    xdescribe("Model Performance", function()
    {

        describe("Backbone Model", function()
        {

            it("Should print some times using simple attributes", function()
            {
                var now = { day: moment().format("YYYY-MM-DD") };
                var startTime = +new Date();
                var Model = Backbone.Model.extend({});
                for(var i = 0;i<100;i++)
                {
                    new Model({ date: now });
                }
                var elapsedTime = +new Date() - startTime;
                console.log("Creating 100 models with simple attributes took " + elapsedTime + "ms");
            });

            it("Should print some times using moment js", function()
            {
                var now = moment();
                var startTime = +new Date();
                var Model = Backbone.Model.extend({});
                for(var i = 0;i<100;i++)
                {
                    new Model({ date: now });
                }
                var elapsedTime = +new Date() - startTime;
                console.log("Creating 100 models with moments took " + elapsedTime + "ms");
            });

            it("Should print some times using complex attributes", function()
            {
                var bottomObj  =
                    [
                        1, 2, 3, 4, 5, 6, 7, 8, 9, 10
                    ];

                var midObj =
                {
                    obj1: bottomObj,
                    obj2: bottomObj,
                    obj3: bottomObj
                };

                var topObj =
                {
                    obj1: midObj,
                    obj2: midObj,
                    obj3: midObj
                };

                var startTime = +new Date();
                var Model = Backbone.Model.extend({});
                for(var i = 0;i<100;i++)
                {
                    new Model({ date: topObj });
                }
                var elapsedTime = +new Date() - startTime;
                console.log("Creating 100 models with complex attributes took " + elapsedTime + "ms");
            });

            it("Should print some times using large detail data", function()
            {
                var startTime = +new Date();
                var Model = Backbone.Model.extend({});
                for(var i = 0;i<100;i++)
                {
                    new Model(DetailDataJSON);
                }
                var elapsedTime = +new Date() - startTime;
                console.log("Creating 100 models with large detail data took " + elapsedTime + "ms");
            });
        });

        describe("Backbone DeepModel", function()
        {

            it("Should print some times using simple attributes", function()
            {
                var now = { day: moment().format("YYYY-MM-DD") };
                var startTime = +new Date();
                var Model = Backbone.DeepModel.extend({});
                for(var i = 0;i<100;i++)
                {
                    new Model({ date: now });
                }
                var elapsedTime = +new Date() - startTime;
                console.log("Creating 100 deepmodels with simple attributes took " + elapsedTime + "ms");
            });

            it("Should print some times using moment js", function()
            {
                var now = moment();
                var startTime = +new Date();
                var Model = Backbone.DeepModel.extend({});
                for(var i = 0;i<100;i++)
                {
                    new Model({ date: now });
                }
                var elapsedTime = +new Date() - startTime;
                console.log("Creating 100 deepmodels with moments took " + elapsedTime + "ms");
            });

            it("Should print some times using complex attributes", function()
            {
                var bottomObj  =
                    [
                        1, 2, 3, 4, 5, 6, 7, 8, 9, 10
                    ];

                var midObj =
                {
                    obj1: bottomObj,
                    obj2: bottomObj,
                    obj3: bottomObj
                };

                var topObj =
                {
                    obj1: midObj,
                    obj2: midObj,
                    obj3: midObj
                };

                var startTime = +new Date();
                var Model = Backbone.DeepModel.extend({});
                for(var i = 0;i<100;i++)
                {
                    new Model({ date: topObj });
                }
                var elapsedTime = +new Date() - startTime;
                console.log("Creating 100 deepmodels with complex attributes took " + elapsedTime + "ms");
            });

            it("Should print some times using large detail data", function()
            {
                var startTime = +new Date();
                var Model = Backbone.DeepModel.extend({});
                for(var i = 0;i<100;i++)
                {
                    new Model(DetailDataJSON);
                }
                var elapsedTime = +new Date() - startTime;
                console.log("Creating 100 deepmodels with large detail data took " + elapsedTime + "ms");
            });
        });

        xdescribe("TP.BaseModel", function()
        {
            xit("Should be fast using large detail data", function()
            {
                var startTime = +new Date();
                var Model = TP.BaseModel.extend({});
                for(var i = 0;i<100;i++)
                {
                    new Model(DetailDataJSON);
                }
                var elapsedTime = +new Date() - startTime;
                expect(elapsedTime).to.be.lt(10);
            });
        });

        xdescribe("TP.DeepModel", function()
        {
            it("Should be slow using large detail data", function()
            {
                var startTime = +new Date();
                var Model = TP.DeepModel.extend({});
                for(var i = 0;i<100;i++)
                {
                    new Model(DetailDataJSON);
                }
                var elapsedTime = +new Date() - startTime;
                expect(elapsedTime).to.be.gt(100);
            });
        });

        describe("WorkoutDetailData Model", function()
        {
            it("Should print some times using large detail data", function()
            {
                var model;
                var startTime = +new Date();
                for(var i = 0;i<100;i++)
                {
                    model = new WorkoutDetailDataModel({}, { disableDevValidations: true });
                    model.set(DetailDataJSON, { disableDevValidations: true });
                }
                var elapsedTime = +new Date() - startTime;
                console.log("Creating 100 WorkoutDetailData models with large detail data took " + elapsedTime + "ms");
            });

            xit("Should be fast using large detail data", function()
            {
                var startTime = +new Date();
                var model;
                for(var i = 0;i<100;i++)
                {
                    model = new WorkoutDetailDataModel({}, { disableDevValidations: true });
                    model.set(DetailDataJSON, { disableDevValidations: true });
                }
                var elapsedTime = +new Date() - startTime;
                expect(elapsedTime).to.be.lt(10);
            });
        });

        describe("WorkoutsCollection", function()
        {

            it("Should print some times using real data", function()
            {
                var startTime = +new Date();
                var collection;
                for(var i = 0;i<100;i++)
                {
                    collection = new WorkoutsCollection();
                    collection.set(WorkoutCollectionJSON, { disableDevValidations: true });
                }
                var elapsedTime = +new Date() - startTime;
                console.log("Creating 100 Workout Collections with " + WorkoutCollectionJSON.length + " real workouts each took " + elapsedTime + "ms");
            });

            xit("Should be fast using real data", function()
            {
                var startTime = +new Date();
                var collection;
                for(var i = 0;i<100;i++)
                {
                    collection = new WorkoutsCollection();
                    collection.set(WorkoutCollectionJSON, { disableDevValidations: true });
                }
                var elapsedTime = +new Date() - startTime;
                expect(elapsedTime).to.be.lt(10);
            });
        });

        describe("Workouts", function()
        {
            it("Should print some times using real data", function()
            {
                var startTime = +new Date();
                var model;
                for (var i = 0; i < 100; i++)
                {
                    model = new WorkoutModel({}, { disableDevValidations: true });
                    model.set(SingleWorkoutJSON, { disableDevValidations: true });
                }
                var elapsedTime = +new Date() - startTime;
                console.log("Creating 100 Workouts with real data took " + elapsedTime + "ms");
            });

            xit("Should be fast using real data", function()
            {
                var startTime = +new Date();
                var model;
                for(var i = 0;i<100;i++)
                {
                    model = new WorkoutModel({}, { disableDevValidations: true });
                    model.set(SingleWorkoutJSON, { disableDevValidations: true });
                }
                var elapsedTime = +new Date() - startTime;
                expect(elapsedTime).to.be.lt(10);
            });
        });
    });

});
