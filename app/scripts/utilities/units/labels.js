define(
[
    "underscore",
    "utilities/units/constants",
    "utilities/workout/layoutFormatter",
    "utilities/workout/workoutTypes"
],
function(_, unitsConstants, workoutLayoutFormatter, workoutTypeUtils)
{

    var unitsHash =
    {
        distance:
        {
            English: {
                abbreviated: "mi",
                unabbreviated: "miles"
            },
            Metric: {
                abbreviated: "km",
                unabbreviated: "kilometers"
            },

            Swim:
            {
                English: {
                    abbreviated: "yds",
                    unabbreviated: "yards"
                },
                Metric: {
                    abbreviated: "m",
                    unabbreviated: "meters"
                }
            },

            Rowing:
            {
                English: {
                    abbreviated: "m",
                    unabbreviated: "meters"
                },
                Metric: {
                    abbreviated: "m",
                    unabbreviated: "meters"
                }
            }
        },
        normalizedPace:
        {
            English: "min/mi",
            Metric: "min/km",

            Swim:
            {
                English: "sec/100y",
                Metric: "sec/100m"
            }
        },
        averagePace:
        {
            English: "min/mi",
            Metric: "min/km",

            Swim:
            {
                English: "sec/100y",
                Metric: "sec/100m"
            }
        },
        averageSpeed:
        {
            English: "mph",
            Metric: "kph",

            Swim:
            {
                English: "yds/min",
                Metric: "m/min"
            },

            Rowing:
            {
                English: "m/min",
                Metric: "m/min"
            }
        },
        calories:
        {
            //English: "Cal", //1 Cal(orie) = 1kcal
            English: "kcal", //We currently only show kcal in flex app
            Metric: "kcal"
        },
        elevationGain:
        {
            English: "ft",
            Metric: "m"
        },
        elevationLoss:
        {
            English: "ft",
            Metric: "m"
        },
        //TODO: will need to add logic to determine type of tss
        tss:
        {
            English: "TSS",
            Metric: "TSS"
        },
        "if":
        {
            English: "IF",
            Metric: "IF"
        },
        energy:
        {
            English: "kJ",
            Metric: "kJ"
        },
        temperature:
        {
            English: "F",
            Metric: "C"
        },
        heartrate:
        {
            English: "bpm",
            Metric: "bpm"
        },
        pace:
        {
            English: "min/mi",
            Metric: "min/km",

            Swim:
            {
                English: "sec/100y",
                Metric: "sec/100m"
            },
            Rowing:
            {
                English: "sec/100m",
                Metric: "sec/100m"
            }
        },
        speed:
        {
            English: "mph",
            Metric: "kph",

            Swim:
            {
                English: "yds/min",
                Metric: "m/min"
            },
            Rowing:
            {
                English: "m/min",
                Metric: "m/min"
            }
        },
        cadence:
        {
            English: "rpm",
            Metric: "rpm"
        },
        torque:
        {
            English: "in-lbs",
            Metric: "Nm"
        },
        elevation:
        {
            English: "ft",
            Metric: "m"
        },
        power:
        {
            English: "W",
            Metric: "W"
        },
        rightpower:
        {
            English: "W",
            Metric: "W"
        },
        time:
        {
            English: "hms",
            Metric: "hms"
        },
        vam:
        {
            English: "m/h",
            Metric: "m/h"
        },
        cm:
        {
            English: "in",
            Metric: "cm"
        },
        kg:
        {
            English: "lbs",
            Metric: "kg"
        },
        ml:
        {
            English: "oz",
            Metric: "ml"
        },
        powerbalance: "",
        duration: "",
        milliseconds: "",
        mmHg: "mmHg",
        hours: "hrs",
        kcal: "kcal",
        mm: "mm",
        "mg/dL": "mg/dL",
        "%": "%",
        "units": "units",
        none: "",
        longitude: "",
        latitude: ""
    };

    var getTssLabel = function(context)
    {

        var tssSource = "";
        var tssSourceKeys = ["tssSource", "trainingStressScoreActualSource"];
        var contexts = [];

        if (context)
        {
            contexts.push(context);
        }

        if (context && context.hasOwnProperty("model"))
        {
            contexts.push(context.model.attributes);
        } else if (context && context.hasOwnProperty("attributes"))
        {
            contexts.push(context.attributes);
        }

        _.each(contexts, function(ctx)
        {
            _.each(tssSourceKeys, function(key)
            {
                if (ctx.hasOwnProperty(key))
                {
                    tssSource = ctx[key] || ctx[key] === 0 ? ctx[key].toString() : ctx[key];
                }
            });
        });

        // in workout it's an int, tssSource, and in lap/peak detail data it's a string
        if (tssSource && workoutLayoutFormatter.trainingStressScoreSource[tssSource])
        {
            return workoutLayoutFormatter.trainingStressScoreSource[tssSource].abbreviation;
        } else if (tssSource)
        {
            var label = _.find(workoutLayoutFormatter.trainingStressScoreSource, function(tssLabel)
            {
                return tssLabel.name === tssSource;
            });

            if (label)
            {
                return label.abbreviation;
            }
        } else
        {
            return "TSS";
        }
    };

    var getUnitsLabel = function(fieldName, sportTypeId, context, options)
    {
        var userUnits = theMarsApp.user.get("units");
        var userUnitsKey = userUnits === unitsConstants.English ? "English" : "Metric";
        var unitsVal;

        var sportTypeName = null;
        if (sportTypeId)
        {
            sportTypeName = workoutTypeUtils.getNameById(sportTypeId);
        }

        if (!unitsHash.hasOwnProperty(fieldName))
            throw new Error("Unknown field type (" + fieldName + ") for unit label");

        if (sportTypeName && unitsHash[fieldName].hasOwnProperty(sportTypeName) && unitsHash[fieldName][sportTypeName].hasOwnProperty(userUnitsKey))
        {
            unitsVal = unitsHash[fieldName][sportTypeName][userUnitsKey];
            if (options && options.abbreviated === false)
            {
                return unitsVal["unabbreviated"];
            }
            return _.isString(unitsVal) ? unitsVal : unitsVal["abbreviated"];
        }
            
        
        //TODO: refactor
        if (fieldName === "tss")
        {
            return getTssLabel(context);
        }

       
        var unitData = unitsHash[fieldName];

        if (options && options.abbreviated === false)
        {
            return unitData[userUnitsKey]["unabbreviated"];
        }

        if (_.isString(unitData))
        {
            return unitData;
        }
        else
        {
            return _.isString(unitData[userUnitsKey]) ? unitData[userUnitsKey] : unitData[userUnitsKey]["abbreviated"];          
        }
    };

    return getUnitsLabel;
});
