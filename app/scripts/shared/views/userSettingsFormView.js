define(
[
    "jquery",
    "underscore",
    "setImmediate",
    "jquerySelectBox",
    "jqueryui/datepicker",
    "moment",
    "backbone",
    "TP",
    "shared/data/athleteTypes",
    "shared/data/countriesAndStates",
    "shared/models/userDataSource",
    "shared/utilities/formUtility",
    "views/userConfirmationView",
    "hbs!templates/views/quickView/fileUploadErrorView",
    "hbs!shared/templates/userSettingsFormTemplate"
],
function(
    $,
    _,
    setImmediate,
    jquerySelectBox,
    datepicker,
    moment,
    Backbone,
    TP,
    athleteTypes,
    countriesAndStates,
    UserDataSource,
    FormUtility,
    UserConfirmationView,
    fileUploadErrorTemplate, 
    userSettingsFormTemplate
)
{

    var selectHours = [
        { data: 0, label: "12:00 AM - 12:59 AM"},
        { data: 1, label: "1:00 AM - 1:59 AM"},
        { data: 2, label: "2:00 AM - 2:59 AM"},
        { data: 3, label: "3:00 AM - 3:59 AM"},
        { data: 4, label: "4:00 AM - 4:59 AM"},
        { data: 5, label: "5:00 AM - 5:59 AM"},
        { data: 6, label: "6:00 AM - 6:59 AM"},
        { data: 7, label: "7:00 AM - 7:59 AM"},
        { data: 8, label: "8:00 AM - 8:59 AM"},
        { data: 9, label: "9:00 AM - 9:59 AM"},
        { data: 10, label: "10:00 AM - 10:59 AM"},
        { data: 11, label: "11:00 AM - 11:59 AM"},
        { data: 12, label: "12:00 PM - 12:59 PM"},
        { data: 13, label: "1:00 PM - 1:59 PM"},
        { data: 14, label: "2:00 PM - 2:59 PM"},
        { data: 15, label: "3:00 PM - 3:59 PM"},
        { data: 16, label: "4:00 PM - 4:59 PM"},
        { data: 17, label: "5:00 PM - 5:59 PM"},
        { data: 18, label: "6:00 PM - 6:59 PM"},
        { data: 19, label: "7:00 PM - 7:59 PM"},
        { data: 20, label: "8:00 PM - 8:59 PM"},
        { data: 21, label: "9:00 PM - 9:59 PM"},
        { data: 22, label: "10:00 PM - 10:59 PM"},
        { data: 23, label: "11:00 PM - 11:59 PM"}
    ];

    var UserBirthdayModel = TP.Model.extend({

        initialize: function(options)
        {
            if(!options.userModel)
            {
                throw new Error("UserBirthdayModel requires a user model");
            }

            this.userModel = options.userModel;
            this._updateSelf();
            this.on("change", this._updateUserModel, this);
            this.listenTo(this.userModel, "change:birthday", _.bind(this._updateSelf, this));
        },

        _updateUserModel: function()
        {
            if(!this.get("birthdayMonth") || !this.get("birthdayYear"))
            {
                return;
            }
            var birthday = moment().date(1).month(this.get("birthdayMonth") - 1).year(this.get("birthdayYear"));
            this.userModel.set("birthday", birthday.format("YYYY-MM-DD"));
        },

        _updateSelf: function()
        {
            if(this.userModel.get("birthday"))
            {
                var birthday = moment(this.userModel.get("birthday"));
                this.set("birthdayMonth", birthday.month() + 1, { silent: true });
                this.set("birthdayYear", birthday.year(), { silent: true });
            }
        }
    });

    var UserNameModel = TP.Model.extend({

        initialize: function(options)
        {
            if(!options.userModel)
            {
                throw new Error("UserNameModel requires a user model");
            }

            this.userModel = options.userModel;
            this._updateSelf();
            this.on("change", this._updateUserModel, this);
            this.listenTo(this.userModel, "change:firstName", _.bind(this._updateSelf, this));
            this.listenTo(this.userModel, "change:lastName", _.bind(this._updateSelf, this));
        },

        _updateUserModel: function()
        {
            if(!this.get("firstAndLastName"))
            {
                return;
            }

            var nameParts = this.get("firstAndLastName").split(" ");
            this.userModel.set("lastName", nameParts.pop());
            this.userModel.set("firstName", nameParts.join(" "));
        },

        _updateSelf: function()
        {
            var nameParts = [];
            if(this.userModel.has("firstName"))
            {
                nameParts.push(this.userModel.get("firstName"));
            }
            if(this.userModel.has("lastName"))
            {
                nameParts.push(this.userModel.get("lastName"));
            }
            this.set("firstAndLastName", nameParts.join(" "), { silent: true });
        }

    });

    var UserSettingsFormView = TP.ItemView.extend(
    {
       
        modelEvents: {},
         
        template:
        {
            type: "handlebars",
            template: userSettingsFormTemplate
        },

        events:
        {
            "click .ical": "_onICalFocus",
            "change input[name=enableVirtualCoachEmails]": "_enableOrDisableVirtualCoachHour",
            "click .photoContainer": "_selectProfilePhoto",
            "click .uploadPhoto": "_selectProfilePhoto",
            "click .removePhoto": "_removeProfilePhoto",
            "change .fileUploadInput": "_onProfilePhotoSelected",
            "click .upgrade": "_showUpgradePrompt"
        },

        initialize: function(options)
        {
            if(!options || !options.userModel)
            {
                throw new Error("UserSettingsFormView requires a user model");
            }

            if(!options || !options.accountSettingsModel)
            {
                throw new Error("UserSettingsFormView requires an account settings model");
            }

            if(!options || !options.athleteSettingsModel)
            {
                throw new Error("UserSettingsFormView requires an athlete settings model");
            }

            if(!options || !options.passwordSettingsModel)
            {
                throw new Error("UserSettingsFormView requires a password settings model");
            }

            this.userModel = options.userModel;
            this.accountSettingsModel = options.accountSettingsModel;
            this.athleteSettingsModel = options.athleteSettingsModel;
            this.passwordSettingsModel = options.passwordSettingsModel;

            this._createUserAdapterModels();
        },

        onRender: function()
        {
            this._applyModelValuesToForm();
            this._updatePhotoUrl();

            var self = this;
            setImmediate(function()
            {
                self._setupSelectBox();
                self._enableOrDisableVirtualCoachHour();
            });
        },

        serializeData: function()
        {
            var data = this.userModel.toJSON();
            this._addConstantsToSerializedData(data);
            if(theMarsApp.featureAuthorizer.canAccessFeature(theMarsApp.featureAuthorizer.features.ViewICalendarUrl))
            {
                this._addICalKeysToSerializedData(data);
            }


            if(theMarsApp.featureAuthorizer.canAccessFeature(theMarsApp.featureAuthorizer.features.ReceivePostActivityNotification))
            {
                data.canReceivePostActivityNotification = true;
            }
            else
            {
                data.canReceivePostActivityNotification = false;
            }

            return data;
        },

        applyFormValuesToModels: function()
        {
            FormUtility.applyValuesToModel(this.$el, this.userModel, { filterSelector: "[data-modelname=user]"});
            FormUtility.applyValuesToModel(this.$el, this.userBirthdayModel, { filterSelector: "[data-modelname=userBirthday]"});
            FormUtility.applyValuesToModel(this.$el, this.userNameModel, { filterSelector: "[data-modelname=userName]"});
            FormUtility.applyValuesToModel(this.$el, this.athleteSettingsModel, { filterSelector: "[data-modelname=athlete]" });
            FormUtility.applyValuesToModel(this.$el, this.accountSettingsModel, { filterSelector: "[data-modelname=account]" });
            FormUtility.applyValuesToModel(this.$el, this.passwordSettingsModel, { filterSelector: "[data-modelname=password]" });
        },

        _createUserAdapterModels: function()
        {

            if(this.userModel.userBirthdayModel)
            {
                this.userBirthdayModel = this.userModel.userBirthdayModel;
            }
            else
            {
                this.userBirthdayModel = new UserBirthdayModel({ userModel: this.userModel });
                this.userModel.userBirthdayModel = this.userBirthdayModel;
            }

            if(this.userModel.userNameModel)
            {
                this.userNameModel = this.userModel.userNameModel;
            }
            else
            {
                this.userNameModel = new UserNameModel({ userModel: this.userModel });
                this.userModel.userNameModel = this.userNameModel;
            }
        },

        _addConstantsToSerializedData: function(data)
        {
            _.extend(data, {
                athleteTypes: athleteTypes,
                countries: countriesAndStates.countries,
                states: countriesAndStates.states,
                hours: selectHours,
                timeZones: theMarsApp.timeZones.get("zonesWithLabels")
            });
        },

        _addICalKeysToSerializedData: function(data)
        {
            data.iCalendarKeys = this.athleteSettingsModel.get("iCalendarKeys");
            data.iCalendarKeys.webcalRoot = "webcal://" + theMarsApp.apiConfig.wwwRoot.replace(/https?:\/\//,"") + "/ical/";
        },

        _applyModelValuesToForm: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.userModel, { filterSelector: "[data-modelname=user]" });
            FormUtility.applyValuesToForm(this.$el, this.userBirthdayModel, { filterSelector: "[data-modelname=userBirthday]" });
            FormUtility.applyValuesToForm(this.$el, this.userNameModel, { filterSelector: "[data-modelname=userName]" });
            FormUtility.applyValuesToForm(this.$el, this.accountSettingsModel, { filterSelector: "[data-modelname=account]" });
            FormUtility.applyValuesToForm(this.$el, this.athleteSettingsModel, { filterSelector: "[data-modelname=athlete]" });
        },

        _setupSelectBox: function()
        {
            this.$("select").selectBoxIt({ viewport: $(".tabbedLayoutBody.scrollable") });
        },

        _onICalFocus: function(e)
        {
            $(e.target).select();
        },

        _selectProfilePhoto: function()
        {
            this.$(".fileUploadInput").click();
        },

        _onProfilePhotoSelected: function()
        {

            var fileList = this.$(".fileUploadInput")[0].files;

            if(!fileList || !fileList.length)
            {
                return;
            }

            var filePath = fileList[0];

            // clear it in case they select the same file twice in a row
            this.$(".fileUploadInput").val('');
            
            this.waitingOn();
            var self = this; 
            UserDataSource.saveProfilePhoto(filePath).done(function(profilePhotoUrl)
            {
                self.userModel.set("profilePhotoUrl", profilePhotoUrl);
                self._updatePhotoUrl();
            }).fail(function()
            {
                new UserConfirmationView({ template: fileUploadErrorTemplate }).render();
            }).always(function()
            {
                self.waitingOff(); 
            });
        },

        _updatePhotoUrl: function()
        {
            var photoUrl = this._buildPhotoUrl();
            if(photoUrl)
            {
                this.$(".profilePicture img").attr("src", photoUrl);
                this.$(".profilePicture").removeClass("nophoto");
            }
            else
            {
                this.$(".profilePicture").addClass("nophoto");
                this.$(".profilePicture img").attr("src", "");
            }
        },

        _buildPhotoUrl: function()
        {
            if(!this.userModel.has("profilePhotoUrl"))
            {
                return null;
            }
            var wwwRoot = UserDataSource.getPhotoRootUrl();
            return wwwRoot + this.userModel.get("profilePhotoUrl");
        },

        _removeProfilePhoto: function()
        {
            this.waitingOn();
            var self = this; 
            UserDataSource.deleteProfilePhoto().done(function(profilePhotoUrl)
            {
                self.userModel.set("profilePhotoUrl", null);
                self._updatePhotoUrl();
            }).fail(function()
            {
                new UserConfirmationView({ template: fileUploadErrorTemplate }).render();
            }).always(function()
            {
                self.waitingOff(); 
            });
        },

        _enableOrDisableVirtualCoachHour: function()
        {
            var hourSelect = this.$("select[name=virtualCoachEmailHour]");
            var enable = this.$("input[name=enableVirtualCoachEmails]").is(":checked");
            if(enable)
            {
                hourSelect.prop("disabled", false);
                hourSelect.selectBoxIt("enable");
            }
            else
            {
                hourSelect.prop("disabled", true);
                hourSelect.selectBoxIt("disable");
            }
        },

        _showUpgradePrompt: function()
        {
            theMarsApp.featureAuthorizer.showUpgradeMessage();
        }

    });

    return UserSettingsFormView;
});

