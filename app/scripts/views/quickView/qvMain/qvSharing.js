define(
[
    "underscore",
    "moment",
    "TP"
],
function (
    _,
    moment,
    TP
)
{
    var PUBLIC = 1;
    var PRIVATE = 2;

    var qvSharing =
    {
        sharingEvents:
        {
            "click .publicCheckbox": "onPublicCheckboxClicked",
            "click .twitterIcon": "onTwitterIconClicked",
            "click .facebookIcon": "onFacebookIconClicked",
            "click .linkIcon": "onLinkIconClicked",
            "click .mailIcon": "onMailIconClicked"
        },

        initializeSharing: function()
        {
            _.extend(this.events, this.sharingEvents);
        },

        onPublicCheckboxClicked: function(e)
        {
            var checkbox = $(e.target);
            if(checkbox.is(":checked"))
            {
                this.model.set("publicSettingValue", PUBLIC);
                this.$(".share").addClass("public");
                this.$(".publicCheckbox").prop("checked", true);
            } else
            {
                this.model.set("publicSettingValue", PRIVATE);
                this.$(".share").removeClass("public");
                this.$(".publicCheckbox").prop("checked", false);
            }
            this.model.save();
        },

        onTwitterIconClicked: function()
        {
            if (this.model.get("publicSettingValue") !== PUBLIC)
            {
                return;
            }

            var url = this.getShortenedUrl();
            var text = this.getTweetText();

            var twitterUrl = "https://twitter.com/intent/tweet?text=" + escape(text) + "&url=" + escape(url);
            window.open(twitterUrl);
        },

        getTweetText: function()
        {
            //Barbara prem Kauffman's Run workout on Tue, 05/28/2013 
            var text = theMarsApp.user.get("firstName") + " " + theMarsApp.user.get("lastName") + "'s";
            text += " " + TP.utils.workout.types.getNameById(this.model.get("workoutTypeValueId")) + " on ";
            text += moment(this.model.get("workoutDay")).format("ddd, MM/DD/YYYY");
            return text;
        },
        
        onFacebookIconClicked: function()
        {

        },

        onLinkIconClicked: function()
        {

        },

        onMailIconClicked: function()
        {

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
        }

    };

    return qvSharing;

});