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

        //rights.push(new AccessRight(new accessrightids.CanPlan,dataTypes.Boolean));
        rights.push(new AccessRight(ids.CanUsePerspectives,dataTypes.Boolean));

        rights.push(new AccessRight(ids.CanViewPods, dataTypes.StringList));
        rights.push(new AccessRight(ids.CanUsePods, dataTypes.StringList));

        rights.push(new AccessRight(ids.CanSeeSecondCalendar,dataTypes.Boolean));
        rights.push(new AccessRight(ids.CanSeeDashboardAndCalendar,dataTypes.Boolean));
        rights.push(new AccessRight(ids.HideAdvertisements, dataTypes.Boolean));
        
        //rights.push(new AccessRight(ids.AllowedFileTypes, dataTypes.StringDictionary));


        rights.push(new AccessRight(ids.CanPlanForUserTypes, dataTypes.NumericList));

        rights.push(new AccessRight(ids.CanAddAthlete, dataTypes.Boolean));
        rights.push(new AccessRight(ids.CanRemoveAthlete, dataTypes.Boolean));
        rights.push(new AccessRight(ids.CanChangePassword, dataTypes.Boolean));


        rights.push(new AccessRight(ids.CanApplyPlan, dataTypes.NumericList));
        rights.push(new AccessRight(ids.CanUseExerciseLibrary, dataTypes.NumericList));

        rights.push(new AccessRight(ids.HidePlanStoreForCoachedByAthletes, dataTypes.Boolean));

        rights.push(new AccessRight(ids.MaximumRoutes, dataTypes.Numeric));
        rights.push(new AccessRight(ids.CanGroupBulkExportForUserTypes, dataTypes.NumericList));
        rights.push(new AccessRight(ids.MaximumExerciseLibrariesOwned, dataTypes.Numeric));
        rights.push(new AccessRight(ids.MaximumExercisesInOwnedLibrary, dataTypes.Numeric));
        rights.push(new AccessRight(ids.MaximumExerciseRoutinesInOwnedLibrary, dataTypes.Numeric));
        rights.push(new AccessRight(ids.MaximumWorkoutTemplatesInOwnedLibrary, dataTypes.Numeric));
        rights.push(new AccessRight(ids.HideStoresForUserTypes, dataTypes.NumericList));
        rights.push(new AccessRight(ids.CanViewReportsForCoach, dataTypes.NumericList));
        rights.push(new AccessRight(ids.CanViewReportsForAffiliate, dataTypes.NumericList));

        rights.push(new AccessRight(ids.CanUseAtp, dataTypes.Boolean));
        rights.push(new AccessRight(ids.CanUseAtpAndVirtualCoach, dataTypes.Boolean));

        return rights;
    };

    var ids =
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

    var dataTypes =
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
        ids: ids,
        dataTypes: dataTypes,
        accessRights: createAccessRights(),
        find: function(accessRightId)
        {
            var ret = _.find(this.accessRights, function(right)
            {
                return right.id === accessRightId;
            });

            if(!ret)
            {
                throw new Error("Invalid access right id: " + accessRightId);
            }

            return ret;
        }
    };
});
