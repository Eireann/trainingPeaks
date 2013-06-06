define(
[
    "underscore",
    "moment",
    "TP",
    "views/quickView/qvMain/qvShortUrlView"
],
function (
    _,
    moment,
    TP,
    ShortUrlView
)
{
    var PUBLIC = 1;
    var PRIVATE = 2;

    var qvSharing =
    {
        sharingEvents:
        {
            "change .publicCheckbox": "onPublicCheckboxClicked",
            "click .twitterIcon": "onTwitterIconClicked",
            "click .facebookIcon": "onFacebookIconClicked",
            "click .linkIcon": "onLinkIconClicked"
        },

        initializeSharing: function()
        {
            _.extend(this.events, this.sharingEvents);
            this.on("render", this.sharingOnRender, this);
        },

        sharingOnRender: function()
        {
            this.enableOrDisableSharing();

            this.model.on("change", this.enableOrDisableSharing, this);

            this.on("close", function()
            {
                this.model.off("change", this.enableOrDisableSharing, this);
            }, this);
        },

        onPublicCheckboxClicked: function(e)
        {
            if (!TP.utils.workout.determineCompletedWorkout(this.model))
            {
                return;
            }

            var checkbox = $(e.target);
            if (checkbox.is(":checked"))
            {
                this.model.set("publicSettingValue", PUBLIC);
            } else
            {
                this.model.set("publicSettingValue", PRIVATE);
            }

            this.model.save();
        },

        onTwitterIconClicked: function()
        {
            if (!this.workoutIsShareable())
            {
                return;
            }

            var url = this.getShortenedUrl();
            var text = this.getSharedText();
            text += " #trainingpeaks";

            var twitterUrl = "https://twitter.com/intent/tweet?text=" + escape(text) + "&url=" + escape(url);
            window.open(twitterUrl, 'twitterWindow', 'width=1000');
        },

        getSharedText: function()
        {

            if (theMarsApp.user.has("firstName"))
            {
                text = theMarsApp.user.get("firstName") + " completed a ";
            }

            if(this.model.has("distance"))
            {
                text += this.formatDistance(this.model.get("distance")) + " " + TP.utils.units.getUnitsLabel("distance", this.model.get("workoutTypeValueId"), this.model) + " ";
            }

            if (this.model.has("workoutTypeValueId"))
            {
                text += TP.utils.workout.types.getNameById(this.model.get("workoutTypeValueId")) + " ";
            }

            if(this.model.has("workoutDay"))
            {
                text += "on " + moment(this.model.get("workoutDay")).format("MM/DD") + " ";
            }

            if(this.model.has("totalTime"))
            {
                text += " in " + this.formatDuration(this.model.get("totalTime")) + " ";
            }

            if(this.model.has("tssActual") && this.model.get("tssActual") !== 0)
            {
                text += "with " + this.model.get("tssActual") + " " + TP.utils.units.getUnitsLabel("tss", this.model.get("workoutTypeValueId"), this.model);
            }

            text += ". ";

            return text;
        },
        
        onFacebookIconClicked: function()
        {
            if (!this.workoutIsShareable())
            {
                return;
            }

            var url = this.getShortenedUrl();
            var windowTitle = document.title;
            var descriptionText = this.getSharedText();
            var appID = 103295416394750;

            var facebookURL = "https://www.facebook.com/dialog/feed?app_id=" + appID + "&link=" + escape(url) + "&picture=https://s3.amazonaws.com/storage.trainingpeaks.com/assets/images/trainingpeaks-activity-viewer.png&name=" + escape(windowTitle) + "&caption=" + escape(url) + "&description=" + escape(descriptionText) + "&redirect_uri=" + escape(url);
            window.open(facebookURL, 'facebookWindow', 'width=1000');
        },

        onLinkIconClicked: function(e)
        {
            if (!this.workoutIsShareable())
            {
                return;
            }

            var linkIcon = $(e.target);
            this.shortUrlView = new ShortUrlView({ model: this.model });

            this.shortUrlView.setPosition({ fromElement: linkIcon, left: linkIcon.outerWidth() + 13, top: -15 });

            this.shortUrlView.render();
        },

        enableOrDisableSharing: function()
        {
            if (this.workoutIsComplete())
            {
                this.$(".publicCheckbox").prop("disabled", false);
            } else
            {
                this.$(".publicCheckbox").prop("disabled", true);
            }

            if (this.workoutIsShareable())
            {
                this.$(".share").addClass("public");
            } else
            {
                this.$(".share").removeClass("public");
            }

            if (this.workoutIsPublic())
            {
                this.$(".publicCheckbox").prop("checked", true);
            } else
            {
                this.$(".publicCheckbox").prop("checked", false);
            }

            this.enableOrDisableEmailLink();
        },

        enableOrDisableEmailLink: function()
        {

            // this has to be an actual link for the user to click on instead of a window.open, so we just enable or disable the url as needed
            var emailLink = this.$(".emailLink");

            if (!this.workoutIsShareable())
            {
                emailLink.attr("href", "javascript: void null;");
                return;
            }

            var mailBody = TP.utils.translate("Click the link below to view the workout") + "\n\n" + this.getShortenedUrl();
            var mailSubject = theMarsApp.user.get("firstName") + " " + theMarsApp.user.get("lastName") + " " + TP.utils.translate("has shared a workout with you");
            var mailtoUrl = "mailto:?subject=" + escape(mailSubject) + "&body=" + escape(mailBody);
            emailLink.attr("href", mailtoUrl);

        },

        getPublicFileViewerUrl: function()
        {
            return theMarsApp.wwwRoot + "/av/" + this.model.get("sharedWorkoutInformationKey");
        },

        getShortenedUrl: function()
        {
            if (!this.model.has("shortUrl"))
            {
                return this.getPublicFileViewerUrl();
            }
            return this.model.get("shortUrl");
        },

        workoutIsComplete: function()
        {
            return TP.utils.workout.determineCompletedWorkout(this.model);
        },

        workoutIsPublic: function()
        {
            return this.model.get("publicSettingValue") === PUBLIC;
        },

        workoutIsShareable: function()
        {
            return this.workoutIsPublic() && this.workoutIsComplete();
        }

    };

    return qvSharing;

});