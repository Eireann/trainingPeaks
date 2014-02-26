define(
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
                expect(requestNonNumericType).to.throw();
            });

            it("Should return an empty array if no value is present for the key", function()
            {
                var model = new UserAccessRightsModel();
                var accessRightsValue = model.getNumericList(accessRights.ids.CanPlanForUserTypes);
                expect(_.isArray(accessRightsValue)).to.equal(true);
                expect(accessRightsValue.length).to.equal(0);
            });

            it("Should return an array of numbers if a value is present", function()
            {
                var model = new UserAccessRightsModel();
                model.set({
                    "rights":[xhrData.accessRights.planFutureWorkouts]
                });
                var accessRightsValue = model.getNumericList(accessRights.ids.CanPlanForUserTypes);
                expect(_.isArray(accessRightsValue)).to.equal(true);
                expect(accessRightsValue[0]).to.equal(4);
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
                expect(requestNonStringType).to.throw();
            });

            it("Should return an empty array if no value is present for the key", function()
            {
                var model = new UserAccessRightsModel();
                var accessRightsValue = model.getStringList(accessRights.ids.CanViewPods);
                expect(_.isArray(accessRightsValue)).to.equal(true);
                expect(accessRightsValue.length).to.equal(0);
            });

            it("Should return an array of strings if a value is present", function()
            {
                var model = new UserAccessRightsModel();
                model.set({
                    "rights":[xhrData.accessRights.canViewPods]
                });
                var accessRightsValue = model.getStringList(accessRights.ids.CanViewPods);
                expect(_.isArray(accessRightsValue)).to.equal(true);
                expect(accessRightsValue[0]).to.equal("journal_GroundControl");
            });

        });

        describe("Numeric Types", function()
        {

            it("Should throw an exception if the datatype for the requested key is not numeric", function()
            {
                var model = new UserAccessRightsModel();
                var requestNonNumericType = function()
                {
                    return model.getNumber(accessRights.accessRightIds.CanViewPods);
                };
                expect(requestNonNumericType).to.throw();
            });

            it("Should return null if no value is present for the key", function()
            {
                var model = new UserAccessRightsModel();
                var accessRightsValue = model.getNumber(accessRights.ids.MaximumExercisesInOwnedLibrary);
                expect(accessRightsValue).to.be.null;
            });

            it("Should return a numeric value if present", function()
            {
                var model = new UserAccessRightsModel();
                model.set({
                    "rights":[{
                        "accessRightItemDataValue": {"data":5},
                        "accessRightIdValue": 18,
                        "accessRightItemDataTypeValue": 2,
                        "accessRightData": 5
                    }]
                });
                var accessRightsValue = model.getNumber(accessRights.ids.MaximumExercisesInOwnedLibrary);
                expect(accessRightsValue).to.equal(5);
            });

        });
    });

});
