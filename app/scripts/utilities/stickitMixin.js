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
    var stickitUtilsMixin = {

        initializeBindingsLUT: function()
        {
            this.bindingsLUT = {};
            _.each(this.bindings, function(value, key)
            {
                if(!this.bindingsLUT.hasOwnProperty(value.observe))
                {
                    this.bindingsLUT[value.observe] = key;
                }
            }, this);
        },

        updateModel: function(newViewValue, options)
        {

            if (!this.bindingsLUT)
                this.initializeBindingsLUT();

            var self = this;
            var saveTimeout = options.saveTimeout ? options.saveTimeout : 2000;

            var updateModel = function()
            {

                // NOTE: For any pace/speed fields that share the same velocityXXX model field,
                // we need input id here for updateModel to work right, 
                // but we don't need it for other fields because we can get it from bindingsLUT
                var inputFieldId = options.inputId ? options.inputId : self.bindingsLUT[options.observe];
                var currentViewValue = self.$(inputFieldId).val();

                // always update the model - even if a save is not required,
                // the parsed view value is equivalent to current model value,
                // but we may have lost formatting, so set the model value which triggers input field to reformat
                self.performModelUpdate(currentViewValue, options);
            };

            if (this.updateModelTimeout)
                clearTimeout(this.updateModelTimeout);

            // TODO: This required a hack at line ~100 of the Backbone.StickIt library in order to work
            // properly. There does not seem to be any other way to catch which type of event triggered
            // this update request.
            if (options.eventType === "blur")
                updateModel();
            else
                this.updateModelTimeout = setTimeout(updateModel, saveTimeout);

            return false;
        },

        checkIfModelSaveRequired: function(newViewValue, options)
        {
            var doUpdateModel = false;
            var currentModelValue = this.model.get(options.observe);

            // DO coerce type in this situation, since we only care about truthy/falsy'ness.
            /*jslint eqeq: true*/
            if (options.ignoreOnSetForUpdateModel || !options.onSet)
            {
                if (newViewValue != currentModelValue)
                {
                    doUpdateModel = true;
                }
            }
            else
            {
                // if the parsed input would be the same as the current value,
                var parsedViewValue = this[options.onSet](newViewValue, options);
                if (parsedViewValue != currentModelValue)
                {

                    doUpdateModel = true;

                    // maybe it's a rounding error? i.e. time in zone = 718.8 in workout file, but we would have rounded it to 719
                    if (options.onGet)
                    {
                        var formattedModelValue = this[options.onGet](currentModelValue, options);
                        var parsedModelValue = this[options.onSet](formattedModelValue, options);
                        if(parsedModelValue == parsedViewValue)
                        {
                            doUpdateModel = false;
                        }
                    }

                }
            }
            /*jsline eqeq: false*/

            return doUpdateModel;
        },

        setModelValue: function(newViewValue, options)
        {
            // Do the save!
            var newModelValue = (options.ignoreOnSetForUpdateModel || !options.onSet) ? newViewValue : this[options.onSet](newViewValue, options);
            this.model.set(options.observe, newModelValue);
            this.trigger("setModelValue", newViewValue, options);
        },

        performModelUpdate: function(newViewValue, options)
        {

            // if model save is required, do it,
            // else trigger a change so the view reformats
            if (this.checkIfModelSaveRequired(newViewValue, options))
            {
                this.setModelValue(newViewValue, options);
                this.saveModel();
            } else
            {
                this.model.trigger("change:" + options.observe, this.model, newViewValue, options);
            }
        },

        // somewhat pointless, but it makes it easy to override for qv tabs ...
        saveModel: function()
        {
            if(this.model.autosave)
            {
                this.model.autosave();
            }
            else
            {
                this.model.save();
            }
        }

    };

    _.extend(stickitUtilsMixin, TP.utils.conversion);
    return stickitUtilsMixin;
});
