requirejs([
          "underscore",
          "localStorage",
          "utilities/localStorageUtils"
          ],
function(
         _,
         localStorage,
         localStorageUtils
         )
{

    describe("Local Storage Utils", function()
    {

        var prefix = "localStorageUtils_";

        beforeEach(function()
        {
            localStorage.clear();
        });

        describe("Get and Set Items", function()
        {

            it("Should return null for unset keys", function()
            {
                expect(localStorageUtils.getItem("unknownKey")).toBeNull();
            });

            it("Should add a localStorageUtils_ prefix", function()
            {
                var key = "testPrefix";
                var value = "something";
                localStorageUtils.setItem(key, value);
                expect(localStorageUtils.getItem(key)).toEqual(value);
                expect(localStorage.getItem(prefix + key)).toEqual(value);
                expect(localStorage.getItem(key)).toEqual(null);               
            });

            it("Should set and get a string value", function()
            {
                var key = "testString";
                var value = "i am a string";
                localStorageUtils.setItem(key, value);
                expect(localStorage.getItem(prefix + key)).toEqual(value);
                expect(localStorageUtils.getItem(key)).toEqual(value);
            });

            it("Should set an get object value", function()
            {
                var key = "testItem";
                var value = { name: "some object", attribute: "something" };
                localStorageUtils.setItem(key, value);
                expect(localStorage.getItem(prefix + key)).toEqual(JSON.stringify(value));
                expect(localStorageUtils.getItem(key)).toEqual(value);
            });

            it("Should overwrite existing values", function()
            {
                var key = "testString";
                var value = "i am a string";
                localStorageUtils.setItem(key, value);
                expect(localStorageUtils.getItem(key)).toEqual(value);

                localStorageUtils.setItem(key, "New Value");
                expect(localStorageUtils.getItem(key)).toEqual("New Value");
            });

            it("Should clear cache and try again on QuotaExceededError", function()
            {
                
                localStorage.setItem(prefix + "quota", "something old");
                var doThrow = true;
                spyOn(localStorage, "setItem").andCallFake(function(key, value)
                {
                    if(doThrow)
                    {
                        var error = new Error("Error: An attempt was made to add something to storage that exceeded the quota");
                        error.code = 22;
                        error.name = "QuotaExceededError";
                        doThrow = false;
                        throw error;
                    }

                    localStorage[key] = value;
                });

                spyOn(localStorage, "removeItem").andCallThrough();
                localStorageUtils.setItem("quota", "will be exceeded");
                expect(localStorageUtils.getItem("quota")).toEqual("will be exceeded");
                expect(localStorage.setItem.calls.length).toEqual(2);
                expect(localStorage.removeItem).toHaveBeenCalledWith(prefix + "quota");
            });

            it("Should re-throw any other errors", function()
            {
                spyOn(localStorage, "setItem").andCallFake(function()
                {
                    throw new Error("Some Exception");
                });

                function badSetItem()
                {
                    localStorageUtils.setItem("key", "value");
                }

                expect(badSetItem).toThrow("Some Exception");
            });
        });

        describe("remove item", function()
        {

            it("Should remove the item", function()
            {
                localStorageUtils.setItem("something", "some value");
                localStorageUtils.removeItem("something");
                expect(localStorageUtils.getItem("something")).toBeNull();
            });

            it("Should not remove items without the localStorageUtils_ prefix", function()
            {
                localStorage.setItem("other key", "something");
                localStorageUtils.removeItem("other key");
                expect(localStorage.getItem("other key")).toEqual("something");
            });
        });

        describe("Clear Storage", function()
        {
            it("Should remove all items with the localStorageUtils_ prefix", function()
            {
                localStorageUtils.setItem("Item One", "My Item");
                localStorageUtils.setItem("Item Two", "Another Item");
                localStorageUtils.clearStorage();
                expect(localStorageUtils.getItem("Item One")).toBeNull();
                expect(localStorageUtils.getItem("Item Two")).toBeNull();
            });

            it("Should not remove values without the prefix", function()
            {
                localStorage.setItem("Item One", "My Item");
                localStorageUtils.setItem("Item Two", "Another Item");
                localStorageUtils.clearStorage();
                expect(localStorageUtils.getItem("Item One")).toBeNull();
                expect(localStorageUtils.getItem("Item Two")).toBeNull();
                expect(localStorage.getItem("Item One")).toEqual("My Item");
            });
        });

    });

});
