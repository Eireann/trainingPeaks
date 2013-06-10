define(
[
    "underscore",
    "moment",
    "TP",
    "models/shortUrlModel",
    "views/quickView/qvMain/qvShortUrlView"
],
function (
    _,
    moment,
    TP,
    ShortUrlModel,
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
            this.model.get("details").on("change", this.onWorkoutDetailsChanged, this);

            this.on("close", function()
            {
                this.model.off("change", this.enableOrDisableSharing, this);
                this.model.get("details").off("change", this.onWorkoutDetailsChanged, this);
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

        getSharedText: function()
        {
            var textArray = [];

            if (theMarsApp.user.get("firstName"))
            {
                textArray.push(theMarsApp.user.get("firstName") + " completed a");
            }

            if (this.model.get("distance"))
            {
                textArray.push(this.formatDistance(this.model.get("distance")) + " " + TP.utils.units.getUnitsLabel("distance", this.model.get("workoutTypeValueId"), this.model));
            }

            if (this.model.get("workoutTypeValueId"))
            {
                textArray.push(TP.utils.workout.types.getNameById(this.model.get("workoutTypeValueId")).toLowerCase() + " workout");
            }

            if(this.model.get("workoutDay"))
            {
                textArray.push("on " + moment(this.model.get("workoutDay")).format("MM/DD"));
            }

            if(this.model.get("totalTime"))
            {
                textArray.push("in " + this.formatDuration(this.model.get("totalTime")));
            }

            if(this.model.get("tssActual") && this.model.get("tssActual") !== 0)
            {
                textArray.push("with " + this.formatTSS(this.model.get("tssActual")) + " " + TP.utils.units.getUnitsLabel("tss", this.model.get("workoutTypeValueId"), this.model));
            }
            var text = textArray.join(" ");
            text += ".";
            return text;
        },
        
        getMailSubjectLine: function ()
        {
            return TP.utils.workout.types.getNameById(this.model.get("workoutTypeValueId")) + " on " + moment(this.model.get("workoutDay")).format("MM/DD");
        },
        
        onTwitterIconClicked: function ()
        {
            if (!this.workoutIsShareable())
            {
                return;
            }

            var url = this.getShortenedUrl();
            var text = this.getSharedText();
            text += " #trainingpeaks";

            var twitterUrl = "https://twitter.com/intent/tweet?text=" + escape(text);
            if (url)
            {
                twitterUrl = twitterUrl + "&url=" + escape(url);
            }
            window.open(twitterUrl, 'twitterWindow', 'width=1000');
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

            //var redirectURL = "https://www.trainingpeaks.com";
            var redirectURL = "https://www.facebook.com";
            var pictureURL = "https://s3.amazonaws.com/storage.trainingpeaks.com/assets/images/trainingpeaks-activity-viewer.png";

            var facebookURL = "https://www.facebook.com/dialog/feed?app_id=" + appID + "&picture=" + escape(pictureURL) + "&name=" + escape(windowTitle) + "&description=" + escape(descriptionText) + "&redirect_uri=" + escape(redirectURL);
            if (url)
            {
                var escapedUrl = escape(url);
                facebookURL += "&link=" + escapedUrl + "&caption=" + escapedUrl;
            }
            window.open(facebookURL, 'facebookWindow', 'width=1000');
        },

        onLinkIconClicked: function(e)
        {
            if (!this.workoutIsShareable() || !this.workoutHasFileData())
            {
                return;
            }

            var linkIcon = $(e.target);
            this.shortUrlView = new ShortUrlView({ model: this.shortUrlModel });

            this.shortUrlView.setPosition({ fromElement: linkIcon, left: linkIcon.outerWidth() + 13, top: -15 });

            this.shortUrlView.render();
        },
        
        enableOrDisableEmailLink: function ()
        {

            // this has to be an actual link for the user to click on instead of a window.open, so we just enable or disable the url as needed
            var emailLink = this.$(".emailLink");

            if (!this.workoutIsShareable())
            {
                emailLink.attr("href", "javascript: void null;");
                return;
            }

            //var mailBody = TP.utils.translate("Click the link below to view the workout") + "\n\n" + this.getShortenedUrl();
            var activityUrl = this.getShortenedUrl();
            var mailBody = this.getSharedText();
            if (activityUrl)
                mailBody += "\n\n" + activityUrl;
            var mailSubject = this.getMailSubjectLine();
            var mailtoUrl = "mailto:?subject=" + escape(mailSubject) + "&body=" + escape(mailBody);
            emailLink.attr("href", mailtoUrl);

        },


        enableOrDisableSharing: function()
        {
            if (this.workoutIsComplete())
            {
                this.$(".publicCheckbox").prop("disabled", false);
                this.$(".publicCheckboxContainer").removeClass("disabled");
            }
            else
            {
                this.$(".publicCheckbox").prop("disabled", true);
                this.$(".publicCheckboxContainer").addClass("disabled");
            }

            var shareClass = this.$(".share");

            if (this.workoutIsShareable())
            {
                shareClass.removeClass("disabled");
                shareClass.find(".twitterIcon").removeClass("disabled");
                shareClass.find(".facebookIcon").removeClass("disabled");
                this.applyLinkIconEnableState();
                shareClass.find(".emailIcon").removeClass("disabled");
            }
            else
            {
                shareClass.addClass("disabled");
                shareClass.find(".twitterIcon").addClass("disabled");
                shareClass.find(".facebookIcon").addClass("disabled");
                this.applyLinkIconEnableState();
                shareClass.find(".emailIcon").addClass("disabled");
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

        getPublicFileViewerUrl: function()
        {
            return theMarsApp.wwwRoot + "/av/" + this.model.get("sharedWorkoutInformationKey");
        },

        getShortenedUrl: function()
        {
            if (!this.shortUrlModel)
                return null;
            else
                return this.shortUrlModel.get("url");
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
        },

        onWorkoutDetailsChanged: function()
        {
            this.resolveShortUrl();
            this.applyLinkIconEnableState();
        },
        
        resolveShortUrl: function()
        {
            if (this.workoutHasFileData() && !this.shortUrlModel)
            {
                this.shortUrlModel = new ShortUrlModel({ workoutId: this.model.get("workoutId") });
                var self = this;
                this.shortUrlModel.fetch().done(function () { self.enableOrDisableEmailLink(); });
            }
            else if (!this.workoutHasFileData())
            {
                this.shortUrlModel = null;
                this.enableOrDisableEmailLink();
            }
        },

        applyLinkIconEnableState: function()
        {
            if (this.workoutIsPublic() && this.workoutIsComplete() && this.workoutHasFileData())
            {
                this.hasFileData = true;
                this.$(".linkIcon").removeClass("disabled");
            } else
            {
                this.hasFileData = false;
                this.$(".linkIcon").addClass("disabled");
            }
        },
        
        workoutHasFileData: function()
        {
            return this.model.get("details").has("workoutDeviceFileInfos") && this.model.get("details").get("workoutDeviceFileInfos").length;
        }
    };

    return qvSharing;

});