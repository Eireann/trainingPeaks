﻿define(
[
    "underscore",
    "moment",
    "TP"
],
function(_, moment, TP)
{

    return TP.Model.extend(
    {

        idAttribute: 'date',
        dateFormat: "YYYY-MM-DD",
        collection: null,

        initialize: function()
        {
            this.configureDate();
            this.configureCollection();
        },

        configureDate: function()
        {
            // we need a date
            var date = this.get("date");
            if(!date)
                throw "CalendarDay requires a date";

            // use a formatted string for date attribute and for calendar id
            this.set("date", moment(date).format(this.dateFormat), { silent: true });
        },

        configureCollection: function()
        {
            // empty collection to store our collection
            this.collection = new TP.Collection();

            // add a model to hold our label
            var dayLabel = new TP.Model({ date: this.get("date") });
            dayLabel.isDateLabel = true;
            this.collection.add(dayLabel);

            // watch for changes on collection?
            //this.collection.on("add", this.change, this);
            //this.collection.on("remove", this.change, this);
        },

        add: function(item)
        {
            this.collection.add(item);
        },

        remove: function(item)
        {
            this.collection.remove(item);
        }

    });
});