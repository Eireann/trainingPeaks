define(
[
    "underscore"
],
function(
    _
         )
{

    var AccessRight = function(id, dataType)
    {
        this.id = id;
        this.dataType = dataType;
    };

    var createAccessRights = function()
    {
        var rights = [];

        //rights.push(new AccessRight(new accessrightaccessRightIds.CanPlan,accessRightDataTypes.Boolean));
        rights.push(new AccessRight(accessRightIds.CanUsePerspectives,accessRightDataTypes.Boolean));

        rights.push(new AccessRight(accessRightIds.CanViewPods, accessRightDataTypes.StringList));
        rights.push(new AccessRight(accessRightIds.CanUsePods, accessRightDataTypes.StringList));

        rights.push(new AccessRight(accessRightIds.CanSeeSecondCalendar,accessRightDataTypes.Boolean));
        rights.push(new AccessRight(accessRightIds.CanSeeDashboardAndCalendar,accessRightDataTypes.Boolean));
        rights.push(new AccessRight(accessRightIds.HideAdvertisements, accessRightDataTypes.Boolean));
        
        //rights.push(new AccessRight(accessRightIds.AllowedFileTypes, accessRightDataTypes.StringDictionary));


        rights.push(new AccessRight(accessRightIds.CanPlanForUserTypes, accessRightDataTypes.NumericList));

        rights.push(new AccessRight(accessRightIds.CanAddAthlete, accessRightDataTypes.Boolean));
        rights.push(new AccessRight(accessRightIds.CanRemoveAthlete, accessRightDataTypes.Boolean));
        rights.push(new AccessRight(accessRightIds.CanChangePassword, accessRightDataTypes.Boolean));


        rights.push(new AccessRight(accessRightIds.CanApplyPlan, accessRightDataTypes.NumericList));
        rights.push(new AccessRight(accessRightIds.CanUseExerciseLibrary, accessRightDataTypes.NumericList));

        rights.push(new AccessRight(accessRightIds.HidePlanStoreForCoachedByAthletes, accessRightDataTypes.Boolean));

        rights.push(new AccessRight(accessRightIds.MaximumRoutes, accessRightDataTypes.Numeric));
        rights.push(new AccessRight(accessRightIds.CanGroupBulkExportForUserTypes, accessRightDataTypes.NumericList));
        rights.push(new AccessRight(accessRightIds.MaximumExerciseLibrariesOwned, accessRightDataTypes.Numeric));
        rights.push(new AccessRight(accessRightIds.MaximumExercisesInOwnedLibrary, accessRightDataTypes.Numeric));
        rights.push(new AccessRight(accessRightIds.MaximumExerciseRoutinesInOwnedLibrary, accessRightDataTypes.Numeric));
        rights.push(new AccessRight(accessRightIds.MaximumWorkoutTemplatesInOwnedLibrary, accessRightDataTypes.Numeric));
        rights.push(new AccessRight(accessRightIds.HideStoresForUserTypes, accessRightDataTypes.NumericList));
        rights.push(new AccessRight(accessRightIds.CanViewReportsForCoach, accessRightDataTypes.NumericList));
        rights.push(new AccessRight(accessRightIds.CanViewReportsForAffiliate, accessRightDataTypes.NumericList));

        rights.push(new AccessRight(accessRightIds.CanUseAtp, accessRightDataTypes.Boolean));
        rights.push(new AccessRight(accessRightIds.CanUseAtpAndVirtualCoach, accessRightDataTypes.Boolean));

        return rights;
    };

    var accessRightIds =
    {
        //CanPlan: 0,
        CanUsePerspectives: 1,
        CanViewPods: 2,
        CanUsePods: 3,
        CanSeeSecondCalendar: 4,
        CanSeeDashboardAndCalendar: 5,
        HideAdvertisements: 6,
        //AllowedFileTypes: 7,
        CanPlanForUserTypes: 8,
        CanAddAthlete: 9,
        CanRemoveAthlete: 10,
        CanChangePassword: 11,
        CanApplyPlan: 12,
        CanUseExerciseLibrary: 13,
        HidePlanStoreForCoachedByAthletes: 14,
        MaximumRoutes: 15,
        CanGroupBulkExportForUserTypes: 16,
        MaximumExerciseLibrariesOwned: 17,
        MaximumExercisesInOwnedLibrary: 18,
        MaximumExerciseRoutinesInOwnedLibrary: 19,
        MaximumWorkoutTemplatesInOwnedLibrary: 20,
        HideStoresForUserTypes: 21,
        CanViewReportsForCoach: 22,
        CanViewReportsForAffiliate: 23,
        CanUseAtp: 24,
        CanUseAtpAndVirtualCoach: 25
    };

    var accessRightDataTypes =
    {
        String: 0,
        Boolean: 1,
        Numeric: 2,
        NumericList: 3,
        GuidList: 4,
        StringList: 5,
        StringDictionary: 6
    };

    return {
        accessRightIds: accessRightIds,
        accessRightDataTypes: accessRightDataTypes,
        accessRights: createAccessRights(),
        find: function(accessRightId)
        {
            return _.find(this.accessRights, function(right)
            {
                return right.id === accessRightId;
            });
        }
    };
});
