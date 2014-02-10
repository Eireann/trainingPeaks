define(
[
    "moment",
    "backbone",
    "TP"
],
function(
    moment,
    Backbone,
    TP
)
{

    var DatelikeCollection = TP.Collection.extend(
    {
        initialize: function(models, options)
        {
            if(!options || !options.manager || !options.datelike)
            {
                throw new Error("DatelikeCollection requires a manager and a datelike string");
            }
            this.manager = options.manager;
            this.datelike = options.datelike;
        },

        get: function(modelOrId)
        {
            var id = modelOrId instanceof Backbone.Model ? modelOrId.id : modelOrId;
            this.manager.ensure(id);
            return this.constructor.__super__.get.apply(this, arguments);
        },

        prepareNext: function(count)
        {
            var last = this.length > 0 ? moment(this.last().id) : moment();
            this.manager.ensureRange(last, moment(last).add(count, this.datelike));
            return this.last(count);
        },

        preparePrevious: function(count)
        {
            var first = this.length > 0 ? moment(this.first().id) : moment();
            this.manager.ensureRange(first, moment(first).subtract(count, this.datelike));
            return this.first(count);
        }

    });

    return DatelikeCollection;

});
