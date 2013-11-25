/*
This model contains the access right values for the current user.
You should not use this model directly to check access rights.
For actual feature access checking please use theMarsApp.featureAuthorizer.canAccessFeature

*/
define(
[
    "underscore",
    "shared/utilities/featureAuthorization/accessRights",
    "TP"
],
function(
    _,
    accessRights,
    TP
    )
{
    return TP.DeepModel.extend(
    {

        defaults: {
            rights: []
        },

        url: function()
        {
            return theMarsApp.apiRoot + "/users/v1/user/accessrights";
        },

        parse: function(resp, options)
        {
            return {
                rights: resp
            };
        },

        getNumber: function(accessRightId)
        {
            var accessRightDefinition = accessRights.find(accessRightId);

            if(accessRightDefinition.dataType !== accessRights.dataTypes.Numeric)
            {
                throw new Error("Requested number, but data type for access right id " + accessRightId + " is not numeric");
            }

            var accessRightForUser = this._findAccessRightValueById(accessRightId);

            if(!accessRightForUser || !accessRightForUser.accessRightData)
            {
                return null;
            }
            else
            {
                return accessRightForUser.accessRightData;
            }

        },

        getNumericList: function(accessRightId)
        {
            var accessRightDefinition = accessRights.find(accessRightId);

            if(accessRightDefinition.dataType !== accessRights.dataTypes.NumericList)
            {
                throw new Error("Requested numeric list, but data type for access right id " + accessRightId + " is not numeric list");
            }

            var accessRightForUser = this._findAccessRightValueById(accessRightId);

            if(!accessRightForUser || !accessRightForUser.accessRightData)
            {
                return [];
            }
            else
            {
                return accessRightForUser.accessRightData;
            }

        },

        getStringList: function(accessRightId)
        {
            var accessRightDefinition = accessRights.find(accessRightId);

            if(accessRightDefinition.dataType !== accessRights.dataTypes.StringList)
            {
                throw new Error("Requested string list, but data type for access right id " + accessRightId + " is not string list");
            }

            var accessRightForUser = this._findAccessRightValueById(accessRightId);

            if(!accessRightForUser || !accessRightForUser.accessRightData)
            {
                return [];
            }
            else
            {
                return accessRightForUser.accessRightData;
            }

        },

        getBoolean: function(accessRightId)
        {
            var accessRightDefinition = accessRights.find(accessRightId);

            if(accessRightDefinition.dataType !== accessRights.dataTypes.Boolean)
            {
                throw new Error("Requested boolean, but data type for access right id " + accessRightId + " is not boolean");
            }

            var accessRightForUser = this._findAccessRightValueById(accessRightId);

            if(!accessRightForUser || !accessRightForUser.accessRightData)
            {
                return false;
            }
            else
            {
                return accessRightForUser.accessRightData;
            }

        },

        _findAccessRightValueById: function(accessRightId)
        {
            return _.find(this.get("rights"), function(right)
            {
                return right.accessRightIdValue === accessRightId;
            });
        }

    });

});
