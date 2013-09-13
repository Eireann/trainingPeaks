// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "underscore",
    "shared/utilities/featureAuthorization/accessRights",
    "shared/models/userAccessRightsModel",
    "testUtils/xhrDataStubs"
],
function(
    _,
    accessRights,
    UserAccessRightsModel,
    xhrData
    )
{

    describe("User Access Rights Model", function()
    {
        describe("Numeric List Types", function()
        {

            it("Should throw an exception if the datatype for the requested key is not numeric list", function()
            {
                var model = new UserAccessRightsModel();
                var requestNonNumericType = function()
                {
                    return model.getNumericList(accessRights.accessRightIds.CanViewPods);
                };
                expect(requestNonNumericType).toThrow();
            });

            it("Should return an empty array if no value is present for the key", function()
            {
                var model = new UserAccessRightsModel();
                var accessRightsValue = model.getNumericList(accessRights.ids.CanPlanForUserTypes);
                expect(_.isArray(accessRightsValue)).toBe(true);
                expect(accessRightsValue.length).toBe(0);
            });

            it("Should return an array of numbers if a value is present", function()
            {
                var model = new UserAccessRightsModel();
                model.set({
                    "rights":[xhrData.accessRights.planFutureWorkouts]
                });
                var accessRightsValue = model.getNumericList(accessRights.ids.CanPlanForUserTypes);
                expect(_.isArray(accessRightsValue)).toBe(true);
                expect(accessRightsValue[0]).toBe(4);
            });

        });

        describe("String List Types", function()
        {

            it("Should throw an exception if the datatype for the requested key is not string list", function()
            {
                var model = new UserAccessRightsModel();
                var requestNonStringType = function()
                {
                    return model.getStringList(accessRights.accessRightIds.CanUsePerspectives);
                };
                expect(requestNonStringType).toThrow();
            });

            it("Should return an empty array if no value is present for the key", function()
            {
                var model = new UserAccessRightsModel();
                var accessRightsValue = model.getStringList(accessRights.ids.CanViewPods);
                expect(_.isArray(accessRightsValue)).toBe(true);
                expect(accessRightsValue.length).toBe(0);
            });

            it("Should return an array of strings if a value is present", function()
            {
                var model = new UserAccessRightsModel();
                model.set({
                    "rights":[xhrData.accessRights.canViewPods]
                });
                var accessRightsValue = model.getStringList(accessRights.ids.CanViewPods);
                expect(_.isArray(accessRightsValue)).toBe(true);
                expect(accessRightsValue[0]).toBe("journal_GroundControl");
            });

        });
    });

});