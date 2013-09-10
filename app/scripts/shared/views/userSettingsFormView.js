define(
[
    "underscore",
    "setImmediate",
    "jquerySelectBox",
    "jqueryui/datepicker",
    "backbone",
    "TP",
    "shared/data/athleteTypes",
    "shared/data/countriesAndStates",
    "shared/models/userDataSource",
    "shared/utilities/formUtility",
    "views/userConfirmationView",
    "hbs!templates/views/quickView/fileUploadErrorView",
    "hbs!templates/views/errors/passwordValidationErrorView",
    "hbs!templates/views/errors/emailValidationErrorView",
    "hbs!shared/templates/userSettingsFormTemplate"
],
function(
    _,
    setImmediate,
    jquerySelectBox,
    datepicker,
    Backbone,
    TP,
    athleteTypes,
    countriesAndStates,
    UserDataSource,
    FormUtility,
    UserConfirmationView,
    fileUploadErrorTemplate,
    passwordValidationErrorTemplate,
    emailValidationErrorTemplate,
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
            "change .fileUploadInput": "_onProfilePhotoSelected"
        },

        initialize: function(options)
        {
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

            this.accountSettingsModel = options.accountSettingsModel;
            this.athleteSettingsModel = options.athleteSettingsModel;
            this.passwordSettingsModel = options.passwordModel;
        },

        onRender: function()
        {
            this._applyModelValuesToForm();
            this._setupDatePicker();
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
            var data = this.model.toJSON();
            this._addConstantsToSerializedData(data);
            this._addICalKeysToSerializedData(data);
            return data;
        },

        applyFormValuesToModels: function()
        {
            FormUtility.applyValuesToModel(this.$el, this.model, { filterSelector: "[data-modelname=user]"});
            FormUtility.applyValuesToModel(this.$el, this.athleteSettingsModel, { filterSelector: "[data-modelname=athlete]" });
            FormUtility.applyValuesToModel(this.$el, this.accountSettingsModel, { filterSelector: "[data-modelname=account]" });
            FormUtility.applyValuesToModel(this.$el, this.passwordSettingsModel, { filterSelector: "[data-modelname=password]" });
        },
        
        processSave: function()
        {
            this.applyFormValuesToModels();
            var self = this;
            return this._validateSave().done(
                function()
                {
                    UserDataSource.saveUserSettingsAndPassword({
                        models: [self.model, self.athleteSettingsModel, self.accountSettingsModel],
                        password: self.passwordSettingsModel.get("password")
                    });
                }
            );
        },

        _validatePassword: function()
        {
            var password = this.passwordSettingsModel.get("password");
            var retypePassword = this.passwordSettingsModel.get("retypePassword"); 

            if((password || retypePassword) && (password !== retypePassword))
            {
                new UserConfirmationView({ template: passwordValidationErrorTemplate }).render();
                return false;
            }

            return true;
        },

        _validateEmail: function()
        {
            var email = self.accountSettingsModel.get("email");
            var validEmail = new RegExp(/^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,4}$/i);

            if(!validEmail.test(email))
            {
                new UserConfirmationView({ template: emailValidationErrorTemplate }).render();
                return false;
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
            data.iCalendarKeys.webcalRoot = "webcal://" + theMarsApp.apiConfig.wwwRoot.replace("http://","") + "/ical/";
        },

        _applyModelValuesToForm: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model, { filterSelector: "[data-modelname=user]" });
            FormUtility.applyValuesToForm(this.$el, this.accountSettingsModel, { filterSelector: "[data-modelname=account]" });
            FormUtility.applyValuesToForm(this.$el, this.athleteSettingsModel, { filterSelector: "[data-modelname=athlete]" });
        },

        _setupDatePicker: function()
        {
            this.$(".datepicker").datepicker(
            {
                dateFormat: "mm/dd/yy",
                changeYear: true,
                changeMonth: true
            });
        },

        _setupSelectBox: function()
        {
            this.$("select").selectBoxIt();
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
                self.model.set("profilePhotoUrl", profilePhotoUrl);
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
            if(!this.model.has("profilePhotoUrl"))
            {
                return null;
            }
            var wwwRoot = UserDataSource.getPhotoRootUrl();
            return wwwRoot + this.model.get("profilePhotoUrl");
        },

        _removeProfilePhoto: function()
        {
            this.waitingOn();
            var self = this; 
            UserDataSource.deleteProfilePhoto().done(function(profilePhotoUrl)
            {
                self.model.set("profilePhotoUrl", null);
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
            var selectBox = hourSelect.data("selectBox-selectBoxIt");
            var enable = this.$("input[name=enableVirtualCoachEmails]").is(":checked");
            if(enable)
            {
                hourSelect.prop("disabled", false);
                selectBox.enable();
            }
            else
            {
                hourSelect.prop("disabled", true);
                selectBox.disable();
            }
        }

    });

    return UserSettingsFormView;
});

