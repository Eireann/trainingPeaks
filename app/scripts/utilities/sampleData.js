define(
[
    "underscore",
    "lazy"
],
function(
    _,
    Lazy
)
{

    function SampleData(channels)
    {
        this.channels = channels;
        this.channelsByName = _.indexBy(channels, function(channel)
        {
            return this.normalizeChannelName(channel.name);
        }, this);

        this.start = 0;
        this.end = this.channels && this.channels[0] && this.channels[0].samples ? this.channels[0].samples.length : 0;
    }

    _.extend(SampleData.prototype,
    {
        normalizeChannelName: function(channelName)
        {
            channelName = channelName.toLowerCase();
            return channelName === "millisecondoffset" ? "time" : channelName;
        },

        deleteChannel: function(channelName)
        {
            channelName = this.normalizeChannelName(channelName);
            var channel = this.channelsByName[channelName];

            this.channels = _.without(this.channels, channel);
            delete this.channelsByName[channelName];
        },

        deleteValues: function(channel)
        {
            var self = this;
            if(channel === "AllChannels")
            {
                _.each(this.channels, function(channel) { self.deleteValues(channel.name); });
            }
            else
            {
                channel = this.normalizeChannelName(channel);
                if(channel === "time" || channel === "distance") return;

                var samples = this.channelsByName[channel].samples;

                for(var i = this.start; i < this.end; i++) { samples[i] = null; }
            }
        },

        get: function(channelName, index)
        {
            var channel = this.getChannel(channelName);
            return channel ? channel.get(index) : null;
        },

        getChannelData: function(channelName)
        {
            return this.channelsByName[this.normalizeChannelName(channelName)];
        },

        getChannel: function(channelName)
        {
            var data = this.channelsByName[this.normalizeChannelName(channelName)];
            return _.isObject(data) ? Lazy(data.samples).slice(this.start, this.end) : null;
        },

        getChannels: function(/* channelNames... */)
        {
            var names = [].slice.apply(arguments);
            var channels = _.map(names, function(name) { return this.getChannel(name); }, this);
            channels = _.reject(channels, _.isNull);

            return !channels.length ? Lazy([]) : channels[0].map(function(item, i)
            {
                return _.map(channels, function(channel) { return channel.get(i); });
            });
        },

        listChannels: function()
        {
            return _.pluck(this.channels, "name");
        },

        slice: function(start, end)
        {
            var subsamples =  new SampleData(this.channels);
            subsamples.start = _.isUndefined(start) ? this.start : this.start + start;
            subsamples.end = _.isUndefined(end) ? this.end : this.start + end;
            return subsamples;
        },

        sliceBy: function(channel, start, end)
        {
            start = this.indexOf(channel, start);
            end = this.indexOf(channel, end);

            return this.slice(start, end);
        },

        indexOf: function(channelName, value)
        {
            var channel = this.getChannel(channelName);
            var index = channel.sortedIndex(value);
            return index <= 0 || channel.get(index) === value ? index : index - 1;
        }

    });

    return SampleData;

});
