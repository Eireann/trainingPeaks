define(
[
    "TP",
    "hbs!templates/views/home/coach/athlete"
],
function (
    TP, 
    athleteItemViewTemplate 
    )
{
    return TP.ItemView.extend(
    {
        showThrobbers: false,
        tagName: "div",
        className: "athlete",

        template:
        {
            type: "handlebars",
            template: athleteItemViewTemplate
        },

        events:
        {
            "click": "onAthleteClick"
        },
        
        initialize: function()
        {

        },
        
        onAthleteClick: function(e)
        {
            var athleteUrl = "calendar/athlete/" + this.model.get("athleteId");

            if (e.ctrlKey)
            {
                window.open(theMarsApp.root + "#" + athleteUrl);
            } else
            {
                theMarsApp.router.navigate(athleteUrl, true);
            }
        }

    });
});