define(
[
    "jqueryTextAreaResize",
    "setImmediate"
],
function(
    textAreaResize,
    setImmediate
)
{

    var summaryViewTextAreas = {

        initializeTextAreas: function()
        {
            this.on("render", this.onRenderTextAreas, this);
        },

        onRenderTextAreas: function()
        {
            if (!this.textAreasInitialized)
            {
                var self = this;
                this.$("textarea").autosize();
                setImmediate(function() { self.setTextAreaHeight(); });
                this.textAreasInitialized = true;
            }
        },

        setTextAreaHeight: function()
        {
            if (this.$("#descriptionInput").val())
                this.$("#descriptionInput").height(this.$("#descriptionInput")[0].scrollHeight);

            if (this.$("#preActivityCommentsInput").val())
                this.$("#preActivityCommentsInput").height(this.$("#preActivityCommentsInput")[0].scrollHeight);

            if (this.$("#postActivityCommentsInput").val())
                this.$("#postActivityCommentsInput").height(this.$("#postActivityCommentsInput")[0].scrollHeight);
        }
    };

    return summaryViewTextAreas;
});
