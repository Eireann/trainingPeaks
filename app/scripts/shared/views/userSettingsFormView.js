define(
[
    "underscore",
    "setImmediate",
    "jquerySelectBox",
    "jqueryui/datepicker",
    "TP",
    "shared/data/athleteTypes",
    "shared/data/countriesAndStates",
    "shared/models/profilePhotoFileData",
    "shared/utilities/formUtility",
    "views/userConfirmationView",
    "hbs!templates/views/quickView/fileUploadErrorView",
    "hbs!shared/templates/userSettingsFormTemplate"
],
function(
    _,
    setImmediate,
    jquerySelectBox,
    datepicker,
    TP,
    athleteTypes,
    countriesAndStates,
    ProfilePhotoFileData,
    FormUtility,
    UserConfirmationView,
    fileUploadErrorTemplate,
    userSettingsFormTemplate
)
{

    var hours = [
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
            "click .ical": "onICalFocus",
            "change input[name=enableVirtualCoachEmails]": "_enableOrDisableVirtualCoachHour",
            "click .profilePicture": "_selectProfilePhoto",
            "change .fileUploadInput": "_onProfilePhotoSelected"
        },

        initialize: function()
        {
        },

        onRender: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model, { filterSelector: "[data-modelname=user]" });
            FormUtility.applyValuesToForm(this.$el, this.model.getAccountSettings(), { filterSelector: "[data-modelname=account]" });
            FormUtility.applyValuesToForm(this.$el, this.model.getAthleteSettings(), { filterSelector: "[data-modelname=athlete]" });

            this.$(".datepicker").datepicker(
            {
                dateFormat: "mm/dd/yy",
                changeYear: true,
                changeMonth: true
            });

            this._updatePhotoUrl();

            var self = this;
            setImmediate(function()
            {
                self.$("select").selectBoxIt();
                self._enableOrDisableVirtualCoachHour();
            });
        },

        serializeData: function()
        {
            var data = this.model.toJSON();
            _.extend(data, {
                athleteTypes: athleteTypes,
                countries: countriesAndStates.countries,
                states: countriesAndStates.states,
                hours: hours,
                timeZones: theMarsApp.timeZones.get("zonesWithLabels")
            });

            data.iCalendarKeys = this.model.getAthleteSettings().get("iCalendarKeys");
            data.iCalendarKeys.webcalRoot = "webcal://" + theMarsApp.apiConfig.wwwRoot.replace("http://","") + "/ical/";

            return data;
        },

        onICalFocus: function(e)
        {
            $(e.target).select();
        },

        save: function()
        {

            FormUtility.applyValuesToModel(this.$el, this.model, { filterSelector: "[data-modelname=user]"});
            FormUtility.applyValuesToModel(this.$el, this.model.getAthleteSettings(), { filterSelector: "[data-modelname=athlete]" });
            FormUtility.applyValuesToModel(this.$el, this.model.getAccountSettings(), { filterSelector: "[data-modelname=account]" });

            var deferred = $.when(
                    this.model.save(),
                    this.model.getAthleteSettings().save(),
                    this.model.getAccountSettings().save()
                );


            var password = this.$("input[name=password]").val().trim();
            if(password)
            {
                deferred = $.when(
                    deferred,
                    this.model.savePassword(password)
                );
            }

            return deferred;
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

            var workoutReader = new TP.utils.workout.FileReader(fileList[0]);
            var fileReaderDeferred = workoutReader.readFile();

            this.waitingOn();
            var self = this; 
            fileReaderDeferred.done(function(fileName, dataAsString)
            {
                var profilePhotoFileData = new ProfilePhotoFileData({ data: dataAsString, fileName: fileName });
                profilePhotoFileData.save().done(function()
                {
                    self.model.set("profilePhotoUrl", profilePhotoFileData.get("profilePhotoUrl"));
                    self._updatePhotoUrl();
                }).fail(function()
                {
                    new UserConfirmationView({ template: fileUploadErrorTemplate }).render();
                }).always(function()
                {
                    self.waitingOff(); 
                });
            });
        },

        _updatePhotoUrl: function()
        {
            var photoUrl = this._createPhotoUrl();
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

        _createPhotoUrl: function()
        {
            if(!this.model.has("profilePhotoUrl"))
            {
                return null;
            }
            var wwwRoot = theMarsApp.apiConfig.devWwwRoot ? theMarsApp.apiConfig.devWwwRoot : theMarsApp.apiConfig.wwwRoot;
            return wwwRoot + this.model.get("profilePhotoUrl");
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

