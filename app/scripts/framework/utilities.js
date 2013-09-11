define(
[
    "utilities/datetime/datetime",
    "utilities/units/units",
    "utilities/workout/workout",
    "utilities/conversion/conversion",
    "utilities/chartBuilder",
    "utilities/filesystem",
    "utilities/athlete/athlete",
    "utilities/trainingPlan/trainingPlan",
    "utilities/collections"
], function(
    datetime,
    units,
    workout,
    conversion,
    chartBuilder,
    filesystem,
    athlete,
    trainingPlan,
    collections
    )
{
    return {
        datetime: datetime,
        units: units,
        workout: workout,
        conversion: conversion,
        chartBuilder: chartBuilder,
        filesystem: filesystem,
        athlete: athlete,
        trainingPlan: trainingPlan,
        collections: collections,

        translate: function(textToTranslate)
        {
            return textToTranslate;
        },

        deepClone: function(object)
        {

            if(_.isArray(object))
            {
                var newArray = [];
                _.each(object, function(arrayItem)
                {
                    newArray.push(this.deepClone(arrayItem));
                }, this);
                return newArray;
            }
            else if(_.isObject(object))
            {
                var newObject = {};
                _.each(_.keys(object), function(key)
                {
                    newObject[key] = this.deepClone(object[key]);
                }, this);
                return newObject;
            }
            else
            {
                return _.clone(object);
            }
        }

    };
});