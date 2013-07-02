requirejs(
["TP"],
function(TP)
{
    describe("TP Web API Model", function()
    {

        it("Should require a webAPIModelName", function()
        {
            var TestModel = TP.APIModel.extend({});
            expect(TestModel).toThrow();
        });

        it("Should not be able to set a key that is not defined in defaults", function()
        {
            var TestModel = TP.APIModel.extend({
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

            expect(setGoodKey).not.toThrow();
            expect(setBadKey).toThrow();
        });

        it("Should not be able to get a key that is not defined in defaults", function()
        {
            var TestModel = TP.APIModel.extend({
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

            expect(getGoodKey).not.toThrow();
            expect(getBadKey).toThrow();
        });

        it("Should also work with a defaults function", function()
        {
            var TestModel = TP.APIModel.extend({
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

            expect(setGoodKey).not.toThrow();
            expect(setBadKey).toThrow();
        });


    });
});