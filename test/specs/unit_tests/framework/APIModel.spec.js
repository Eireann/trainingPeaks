requirejs(
[
    "moment",
    "framework/APIModel"
],
function(moment, APIModel)
{
    describe("TP Web API Model", function()
    {

        describe("BaseModel", function()
        {
            it("Should not allow to set moment objects as attributes", function()
            {
                var Model = APIModel.BaseModel.extend({});

                var model = new Model();
                var setMoment = function()
                {
                    model.set("today", moment());
                };
                var setString = function()
                {
                    model.set("tomorrow", moment().add("days", 1).format("YYYY-MM-DD"));
                };
                expect(setString).to.not.throw();
                expect(setMoment).to.throw("Do not use moments as model attributes, due to performance issues");
            });
        });

        describe("APIModel", function()
        {
            it("Should require a webAPIModelName", function()
            {
                var TestModel = APIModel.APIDeepModel.extend({});
                expect(TestModel).to.throw();
            });

            it("Should not be able to set a key that is not defined in defaults", function()
            {
                var TestModel = APIModel.APIDeepModel.extend({
                    webAPIModelName: "TestModel",
                    idAttribute: "idkey",
                    defaults: {
                        goodkey: "SomeDefaultValue",
                        idkey: "ThisIsMyId"
                    }
                });

                function setGoodKey()
                {
                    var model = new TestModel();
                    model.set("goodkey", "SomeValue");
                }

                function setBadKey()
                {
                    var model = new TestModel();
                    model.set("badkey", "SomeValue");
                }

                expect(setGoodKey).to.not.throw();
                expect(setBadKey).to.throw();
            });

            it("Should not be able to get a key that is not defined in defaults", function()
            {
                var TestModel = APIModel.APIDeepModel.extend({
                    webAPIModelName: "TestModel",
                    idAttribute: "idkey",
                    defaults: {
                        goodkey: "SomeDefaultValue",
                        idkey: "ThisIsMyId"
                    }
                });

                function getGoodKey()
                {
                    var model = new TestModel();
                    return model.get("goodkey");
                }

                function getBadKey()
                {
                    var model = new TestModel();
                    return model.get("badkey");
                }

                expect(getGoodKey).to.not.throw();
                expect(getBadKey).to.throw();
            });

            it("Should also work with a defaults function", function()
            {
                var TestModel = APIModel.APIDeepModel.extend({
                    webAPIModelName: "TestModel",
                    idAttribute: "idkey",
                    defaults: function()
                    {
                        return {
                            goodkey: "SomeDefaultValue",
                            idkey: "ThisIsMyId"
                        };
                    }
                });

                function setGoodKey()
                {
                    var model = new TestModel();
                    model.set("goodkey", "SomeValue");
                }

                function setBadKey()
                {
                    var model = new TestModel();
                    model.set("badkey", "SomeValue");
                }

                expect(setGoodKey).to.not.throw();
                expect(setBadKey).to.throw();
            });

            it("Should not allow to set moment objects as attributes", function()
            {
                var Model = APIModel.APIDeepModel.extend({
                    webAPIModelName: "test",
                    idAttribute: "id",
                    defaults: {
                        id: null,
                        today: null,
                        tomorrow: null
                    }
                });

                var model = new Model();
                var setMoment = function()
                {
                    model.set("today", moment());
                };
                var setString = function()
                {
                    model.set("tomorrow", moment().add("days", 1).format("YYYY-MM-DD"));
                };
                expect(setString).to.not.throw();
                expect(setMoment).to.throw("test: Do not use moments as model attributes, due to performance issues");
            });
        });
    });
});
