// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "shared/utilities/featureAuthorization/accessRights",
    "underscore",
    "TP"
],
function(
    accessRights,
    _,
    TP
    )
{

    describe("Access Rights Definitions", function()
    {
        it("Should have a valid constructor", function ()
        {
            expect(accessRights).toBeDefined();
        });

        it("Should contain access right ids", function()
        {
            expect(accessRights.ids).toBeDefined();
            expect(accessRights.ids.CanPlanForUserTypes).toBe(8);
        });

        it("Should contain access right data types", function()
        {
            expect(accessRights.dataTypes).toBeDefined();
            expect(accessRights.dataTypes.NumericList).toBe(3);
        });

        it("Should find access right details by id", function()
        {
            var hideStoresForUserTypes = accessRights.find(accessRights.ids.HideStoresForUserTypes);
            expect(hideStoresForUserTypes).toBeDefined();
            expect(hideStoresForUserTypes).not.toBeNull();
            expect(hideStoresForUserTypes.id).toBe(accessRights.ids.HideStoresForUserTypes);
            expect(hideStoresForUserTypes.dataType).toBe(accessRights.dataTypes.NumericList);
        });

        it("Should throw an exception if an invalid access right id is requested", function()
        {
            var getInvalidId = function()
            {
                return accessRights.find(999);
            };

            expect(getInvalidId).toThrow();
        });
    });

});