define([
          "underscore",
          "utilities/localStorageUtils"
          ],
function(
         _,
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
                expect(localStorageUtils.getItem("unknownKey")).to.be.null;
            });

            it("Should add a localStorageUtils_ prefix", function()
            {
                var key = "testPrefix";
                var value = "something";
                localStorageUtils.setItem(key, value);
                expect(localStorageUtils.getItem(key)).to.eql(value);
                expect(localStorage.getItem(prefix + key)).to.eql(value);
                expect(localStorage.getItem(key)).to.eql(null);               
            });

            it("Should set and get a string value", function()
            {
                var key = "testString";
                var value = "i am a string";
                localStorageUtils.setItem(key, value);
                expect(localStorage.getItem(prefix + key)).to.eql(value);
                expect(localStorageUtils.getItem(key)).to.eql(value);
            });

            it("Should set an get object value", function()
            {
                var key = "testItem";
                var value = { name: "some object", attribute: "something" };
                localStorageUtils.setItem(key, value);
                expect(localStorage.getItem(prefix + key)).to.eql(JSON.stringify(value));
                expect(localStorageUtils.getItem(key)).to.eql(value);
            });

            it("Should overwrite existing values", function()
            {
                var key = "testString";
                var value = "i am a string";
                localStorageUtils.setItem(key, value);
                expect(localStorageUtils.getItem(key)).to.eql(value);

                localStorageUtils.setItem(key, "New Value");
                expect(localStorageUtils.getItem(key)).to.eql("New Value");
            });

            it("Should clear cache and try again on QuotaExceededError", function()
            {
                
                localStorage.setItem(prefix + "quota", "something old");
                var doThrow = true;
                sinon.stub(localStorage, "setItem", function(key, value)
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

                sinon.spy(localStorage, "removeItem");
                localStorageUtils.setItem("quota", "will be exceeded");
                expect(localStorageUtils.getItem("quota")).to.eql("will be exceeded");
                expect(localStorage.setItem.callCount).to.eql(2);
                expect(localStorage.removeItem).to.have.been.calledWith(prefix + "quota");
            });

            it("Should fail silently on repeated QuotaExceededError, in case user's local storage is disabled", function()
            {
                
                sinon.stub(localStorage, "setItem", function(key, value)
                {
                    var error = new Error("Error: An attempt was made to add something to storage that exceeded the quota");
                    error.code = 22;
                    error.name = "QuotaExceededError";
                    throw error;
                });

                function setItem() {
                    localStorageUtils.setItem("quota", "will be exceeded");
                }

                expect(setItem).to.not.throw();
                expect(localStorageUtils.getItem("quota")).to.be.null;
                expect(localStorage.setItem.callCount).to.eql(2);
            });

            it("Should re-throw any other errors", function()
            {
                sinon.stub(localStorage, "setItem", function()
                {
                    throw new Error("Some Exception");
                });

                function badSetItem()
                {
                    localStorageUtils.setItem("key", "value");
                }

                expect(badSetItem).to.throw("Some Exception");
            });
        });

        describe("remove item", function()
        {

            it("Should remove the item", function()
            {
                localStorageUtils.setItem("something", "some value");
                localStorageUtils.removeItem("something");
                expect(localStorageUtils.getItem("something")).to.be.null;
            });

            it("Should not remove items without the localStorageUtils_ prefix", function()
            {
                localStorage.setItem("other key", "something");
                localStorageUtils.removeItem("other key");
                expect(localStorage.getItem("other key")).to.eql("something");
            });
        });

        describe("Clear Storage", function()
        {
            it("Should remove all items with the localStorageUtils_ prefix", function()
            {
                localStorageUtils.setItem("Item One", "My Item");
                localStorageUtils.setItem("Item Two", "Another Item");
                localStorageUtils.clearStorage();
                expect(localStorageUtils.getItem("Item One")).to.be.null;
                expect(localStorageUtils.getItem("Item Two")).to.be.null;
            });

            it("Should not remove values without the prefix", function()
            {
                localStorage.setItem("Item One", "My Item");
                localStorageUtils.setItem("Item Two", "Another Item");
                localStorageUtils.clearStorage();
                expect(localStorageUtils.getItem("Item One")).to.be.null;
                expect(localStorageUtils.getItem("Item Two")).to.be.null;
                expect(localStorage.getItem("Item One")).to.eql("My Item");
            });
        });

    });

});
