define(
[
    "underscore",
    "moment",
    "TP"
],
function(_, moment, TP)
{

    return TP.Model.extend(
    {

        idAttribute: 'dateString',
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
            if(!date) {
                throw "CalendarDay requires a date";
            }

            // date must be a moment
            if (!moment.isMoment(date))
            {
                date = moment(date);
                this.set("date", date, { silent: true });
            }

            // formatted date for id in collection 
            this.set("dateString", moment(date).format(this.dateFormat), { silent: true });
        },

        configureCollection: function()
        {
            // empty collection to store our collection
            this.collection = new TP.Collection();
            this.collection.on("all", this.bubbleUpEvent, this);

            // add a model to hold our label
            var dayLabel = new TP.Model({ date: this.get("date") });
            dayLabel.isDateLabel = true;
            this.collection.add(dayLabel);

            // watch for changes on collection
            this.collection.on("add", this.change, this);
            this.collection.on("remove", this.change, this);
        },

        bubbleUpEvent: function(event)
        {
            this.trigger.apply(this, arguments);
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