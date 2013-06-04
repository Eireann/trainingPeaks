define(
[
    "underscore",
    "TP"
],
function (
    _,
    TP
)
{
    var PUBLIC = 1;
    var PRIVATE = 2;

    var qvSharing =
    {
        sharingEvents:
        {
            "click .public": "onPublicCheckboxClicked"
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
                this.$(".public").attr("checked", true);
            } else
            {
                this.model.set("publicSettingValue", PRIVATE);
                this.$(".share").removeClass("public");
                this.$(".public").attr("checked", false);
            }
            this.model.save();
        }

    };

    return qvSharing;

});