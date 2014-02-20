define(
[
    "jquery",
    "underscore",
    "backbone",
    "utilities/workout/fileReader",
    "shared/models/profilePhotoFileData"
],
function(
    $,
    _,
    Backbone,
    FileReader,
    ProfilePhotoFileData
)
{

    var UserDataSource = {

        saveUserSettingsAndPassword: function(options)
        {
            if(options.password)
            {
                return $.when(
                    UserDataSource.saveUserSettings(options.models),
                    UserDataSource.savePassword(options.password)
                );
            }  
            else
            {
                return UserDataSource.saveUserSettings(options.models);
            }
        },

        saveUserSettings: function(models)
        {
            var modelSaveDeferreds = _.map(models, function(model)
            {
                return model.save();
            });

            return $.when.apply($, modelSaveDeferreds);
        },

        savePassword: function(password)
        {
            var ajaxOptions = {
                url: theMarsApp.apiRoot + "/users/v1/user/auth",
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify({ text: password })
            };
            return Backbone.ajax(ajaxOptions);
        },

        saveProfilePhoto: function(sourceFile)
        {
            var deferred = new $.Deferred();

            new FileReader(sourceFile).readFile().done(
                function(fileName, dataAsString)
                {
                    var profilePhotoFileData = new ProfilePhotoFileData({ data: dataAsString, fileName: fileName });
                    profilePhotoFileData.save().done(
                        function()
                        {
                            deferred.resolveWith(this, [profilePhotoFileData.get("profilePhotoUrl")]);
                        }
                    ).fail(
                        function()
                        {
                            deferred.reject();
                        }
                    );
                }
            ).fail(
                function()
                {
                    deferred.reject();
                }
            );

            return deferred;
        },

        saveZones: function(athleteModel)
        {
            var requests = _.map(["heartRate", "power", "speed"], function(zoneType)
            {
                var zones = athleteModel.get(zoneType + "Zones");
                var ajaxOptions = {
                    url: theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteModel.id + "/" + zoneType.toLowerCase() + "zones",
                    type: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify(zones)
                };

                return Backbone.ajax(ajaxOptions);
            },
            this);

            return $.when.apply($, requests);
        },

        deleteProfilePhoto: function()
        {
            var ajaxOptions = {
                url: theMarsApp.apiRoot + "/users/v1/user/" + theMarsApp.user.id + "/profilephoto",
                type: "DELETE"
            };
            return Backbone.ajax(ajaxOptions);
        },

        getPhotoRootUrl: function()
        {
            return theMarsApp.apiConfig.devWwwRoot ? theMarsApp.apiConfig.devWwwRoot : theMarsApp.apiConfig.wwwRoot;
        },

        verifyEmail: function()
        {
            var ajaxOptions = {
                url: theMarsApp.apiRoot + "/users/v1/user/" + theMarsApp.user.id + "/verifyemail",
                type: "POST"
            };
            return Backbone.ajax(ajaxOptions);
        }

    };


    return UserDataSource;

});

