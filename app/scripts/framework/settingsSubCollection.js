define(
[
   "underscore",
    "TP"
],
function(
    _,
    TP
)
{   
    return TP.Collection.extend(
    {
        initialize: function(models, options)
        {
            if(!options.sourceModel)
            {
                throw new Error("SettingsSubCollection requires a sourceModel");
            }

            if(!options.sourceKey)
            {
                throw new Error("SettingsSubCollection requires a sourceKey");
            }

            if(!options.sourceModel.has(options.sourceKey))
            {
                throw new Error("SettingsSubCollection: sourceModel has no " + options.sourceKey);
            } 

            this.sourceModel = options.sourceModel;
            this.sourceKey = options.sourceKey;

            if(options.modelOptions)
            {
                this.modelOptions = options.modelOptions;
            }

            this.set(this.sourceModel.get(this.sourceKey), this.modelOptions); 

            this.each(this._overrideSave, this);

            this.on("add", this._onModelAdded, this);
            this.on("sort remove", this._resetSourceModel, this);
            this.on("change", this._onModelChanged, this);

            this.listenTo(this.sourceModel, "change:" + this.sourceKey + ".*", _.bind(this._onSourceModelChanged, this));
        },

        releaseSourceModel: function()
        {
            this.stopListening(this.sourceModel, "change:" + this.sourceKey + ".*");
        },

        model: TP.Model,
        
        _onSourceModelChanged: function(model, value, options)
        {
            if(this !== options.changedBy)
            {
                throw new Error("Settings Sub Collection: source model should not be modified except by this collection");
            }
        },

        _onModelAdded: function(model, collection, options)
        {
            this._overrideSave(model);
            this._resetSourceModel();
        },

        _resetSourceModel: function()
        {
            var mappedAttributes = this.map(function(model){ return model.attributes; });
            this.sourceModel.set(this.sourceKey, mappedAttributes, { changedBy: this });
        },

        _overrideSave: function(model)
        {
            model.save = _.bind(this._proxySave, this);
        },

        _onModelChanged: function(model, options)
        {
            var index = this.indexOf(model);
            var changes = this._mapAttrKeys(model.changed, index); 
            options = _.defaults({ changedBy: this }, options);
            this.sourceModel.set(changes, options);
        },

        _mapAttrKeys: function(attrs, index)
        {
            var mappedAttrs = {};

            _.each(attrs, function(value, key)
            {
                mappedAttrs[this.sourceKey + "." + index + "." + key] = value;
            }, this);

            return mappedAttrs;
        },

        _proxySave: function(key, value, options)
        {
            if(arguments.length > 0)
            {
                throw new Error("Settings Sub Collection models don't yet support saving with arguments");
            }
            this.sourceModel.save(); 
        }
    });

});
