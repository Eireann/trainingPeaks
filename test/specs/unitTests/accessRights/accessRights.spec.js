define(
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
            expect(accessRights).to.not.be.undefined;
        });

        it("Should contain access right ids", function()
        {
            expect(accessRights.ids).to.not.be.undefined;
            expect(accessRights.ids.CanPlanForUserTypes).to.equal(8);
        });

        it("Should contain access right data types", function()
        {
            expect(accessRights.dataTypes).to.not.be.undefined;
            expect(accessRights.dataTypes.NumericList).to.equal(3);
        });

        it("Should find access right details by id", function()
        {
            var hideStoresForUserTypes = accessRights.find(accessRights.ids.HideStoresForUserTypes);
            expect(hideStoresForUserTypes).to.not.be.undefined;
            expect(hideStoresForUserTypes).to.not.be.null;
            expect(hideStoresForUserTypes.id).to.equal(accessRights.ids.HideStoresForUserTypes);
            expect(hideStoresForUserTypes.dataType).to.equal(accessRights.dataTypes.NumericList);
        });

        it("Should throw an exception if an invalid access right id is requested", function()
        {
            var getInvalidId = function()
            {
                return accessRights.find(999);
            };

            expect(getInvalidId).to.throw();
        });
    });

});
