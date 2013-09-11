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
            expect(accessRights.accessRightIds).toBeDefined();
            expect(accessRights.accessRightIds.CanPlanForUserTypes).toBe(8);
        });

        it("Should contain access right data types", function()
        {
            expect(accessRights.accessRightDataTypes).toBeDefined();
            expect(accessRights.accessRightDataTypes.NumericList).toBe(3);
        });

        it("Should find access right details by id", function()
        {
            var hideStoresForUserTypes = accessRights.find(accessRights.accessRightIds.HideStoresForUserTypes);
            expect(hideStoresForUserTypes).toBeDefined();
            expect(hideStoresForUserTypes).not.toBeNull();
            expect(hideStoresForUserTypes.id).toBe(accessRights.accessRightIds.HideStoresForUserTypes);
            expect(hideStoresForUserTypes.dataType).toBe(accessRights.accessRightDataTypes.NumericList);
        });
    });

});