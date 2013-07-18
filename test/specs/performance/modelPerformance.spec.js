requirejs(
[
    "moment",
    "backbone",
    "backbone.deepmodel",
    "TP",
    "testUtils/AppTestData/GET_DetailData_134283074"
],
function(
    moment,
    Backbone,
    BackboneDeepModel,
    TP,
    DetailData1
    )
{

    describe("Model Performance", function()
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
                    new Model({ details: DetailData1 });
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
                    new Model({ details: DetailData1 });
                }
                var elapsedTime = +new Date() - startTime;
                console.log("Creating 100 deepmodels with large detail data took " + elapsedTime + "ms");
            });
        });

        describe("TP.BaseModel", function()
        {
            it("Should be fast using large detail data", function()
            {
                var startTime = +new Date();
                var Model = TP.BaseModel.extend({});
                for(var i = 0;i<100;i++)
                {
                    new Model({ details: DetailData1 });
                }
                var elapsedTime = +new Date() - startTime;
                console.log("Creating 100 TP.BaseModels with large detail data took " + elapsedTime + "ms");
                expect(elapsedTime).toBeLessThan(5);
            });
        });

        describe("TP.DeepModel", function()
        {
            it("Should be slow using large detail data", function()
            {
                var startTime = +new Date();
                var Model = TP.DeepModel.extend({});
                for(var i = 0;i<100;i++)
                {
                    new Model({ details: DetailData1 });
                }
                var elapsedTime = +new Date() - startTime;
                console.log("Creating 100 TP.DeepModels with large detail data took " + elapsedTime + "ms");
                expect(elapsedTime).toBeGreaterThan(100);
            });
        });

    });

});