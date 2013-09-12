﻿// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "underscore",
    "shared/utilities/featureAuthorization/accessRights",
    "shared/models/userAccessRightsModel"
],
function(
    _,
    accessRights,
    UserAccessRightsModel
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
                    "rights":[
                        {
                            "accessRightItemDataValue": {"data":"4"},
                            "accessRightIdValue":8,
                            "accessRightItemDataTypeValue":3,
                            "accessRightData":[4]
                        }
                    ]
                });
                var accessRightsValue = model.getNumericList(accessRights.ids.CanPlanForUserTypes);
                expect(_.isArray(accessRightsValue)).toBe(true);
                expect(accessRightsValue[0]).toBe(4);
            });

        });

    });

});