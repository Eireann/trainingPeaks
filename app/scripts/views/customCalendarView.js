define(
[
    "backbone.marionette",
    "hbs!templates/views/customCalendar"
],
function(Marionette, customCalendarTemplate)
{
    return Marionette.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: customCalendarTemplate
        },

        modelEvents:
        {
            "change": "render"
        },

        collectionEvents:
        {
            //"add": "",
            //"remove": "",
            "reset": "render"
        },

        serializeData: function()
        {
            var data = this.model.toJSON();
            _.extend(data, { collection: this.collection.toJSON });
            return data;
        },
        
        onRender: function()
        {
            if (!this.collection)
                throw "CalendarView needs a Collection!";

            var data = this.collection.toJSON();
            
        }

    });
});