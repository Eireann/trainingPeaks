define([], function()
{

    var Lawnchair = function(options, callback)
    {
        // ensure Lawnchair was called as a constructor
        if (!(this instanceof Lawnchair)) return new Lawnchair(options, callback);

        this.records = {};

        // options are optional; callback is not
        if (arguments.length <= 2 && arguments.length > 0)
        {
            callback = (typeof arguments[0] === 'function') ? arguments[0] : arguments[1];
            options = (typeof arguments[0] === 'function') ? {} : arguments[0];
        } else
        {
            throw 'Incorrect # of ctor args!'
        }
        // TODO perhaps allow for pub/sub instead?
        if (typeof callback !== 'function') throw 'No callback was provided';

        this.each = function(callback)
        {
            for (var key in this.records)
{
                callback.call(this, this.records[key]);
            }
            return this;
        };

        this.remove = function(record, callback)
        {
            var key = record.key ? record.key : record;
            delete this.records[key];

            if (callback)
                callback.call(this, record);

            return this;
        };

        this.get = function(record, callback)
{
            var key = record.key ? record.key : record;
            var foundRecord = this.records.hasOwnProperty(key) ? this.records[key] : null;

            if (foundRecord && callback)
                callback.call(this, foundRecord);

            return this;
        }


        this.save = function(record, callback)
{
            var key = record.key ? record.key : record;
            this.records[key] = record;

            if (callback)
                callback.call(this, record);

            return this;
        }

        callback.call(this);

    };

    return Lawnchair;
});
