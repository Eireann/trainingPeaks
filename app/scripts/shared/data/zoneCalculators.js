define(
[
],
function()
{

    var heartRateZoneCalculatorTypes = {
        LactateThreshold: 1,
        MaximumHeartRate: 2,
        MaxAndRestingHeartRate: 3,
        LTAndMaxHeartRate: 4
    };

    var heartRateZoneCalculators = {
        FrielZone: {
            id: 1,
            label: "Joe Friel",
            numberOfZones: 7,
            type: heartRateZoneCalculatorTypes.LactateThreshold
        },
        FrielRunZone: {
            id: 2,
            label: "Joe Friel for Running",
            numberOfZones: 7,
            type: heartRateZoneCalculatorTypes.LactateThreshold
        },
        FrielBikeZone: {
            id: 3,
            label: "Joe Friel for Cycling",
            numberOfZones: 7,
            type: heartRateZoneCalculatorTypes.LactateThreshold
        },
        CogganZone: {
            id: 4,
            label: "Andy Coggan",
            numberOfZones: 5,
            type: heartRateZoneCalculatorTypes.LactateThreshold
        },
        CycleSmartZone: {
            id: 5,
            label: "CycleSmart",
            numberOfZones: 5,
            type: heartRateZoneCalculatorTypes.LactateThreshold
        },
        USACZone: {
            id: 6,
            label: "USAC",
            numberOfZones: 5,
            type: heartRateZoneCalculatorTypes.LactateThreshold
        },
        BCFZone: {
            id: 7,
            label: "BCF/ABCC/WCPP Revised",
            numberOfZones: 7,
            type: heartRateZoneCalculatorTypes.MaximumHeartRate
        },
        EdwardsZone: {
            id: 8,
            label: "Sally Edwards",
            numberOfZones: 5,
            type: heartRateZoneCalculatorTypes.MaximumHeartRate
        },
        TimexZone: {
            id: 9,
            label: "Timex",
            numberOfZones: 5,
            type: heartRateZoneCalculatorTypes.MaximumHeartRate
        },
        KeenZone: {
            id: 10,
            label: "Peter Keen",
            numberOfZones: 4,
            type: heartRateZoneCalculatorTypes.MaximumHeartRate
        },
        SternZone: {
            id: 11,
            label: "Ric Stern",
            numberOfZones: 7,
            type: heartRateZoneCalculatorTypes.MaximumHeartRate
        },
        KarvonenZone: {
            id: 12,
            label: "Karvonen",
            numberOfZones: 4,
            type: heartRateZoneCalculatorTypes.MaxAndRestingHeartRate
        },
        ACSMZone: {
            id: 13,
            label: "ACSM",
            numberOfZones: 1,
            type: heartRateZoneCalculatorTypes.MaxAndRestingHeartRate
        },
        TimexManualZone: {
            id: 14,
            label: "Timex Manual Entry",
            numberOfZones: 1,
            type: heartRateZoneCalculatorTypes.MaximumHeartRate
        },
        CTSZone: {
            id: 17,
            label: "CTS Cycling",
            numberOfZones: 7,
            type: heartRateZoneCalculatorTypes.LTAndMaxHeartRate
        },
        CTSRunZone: {
            id: 18,
            label: "CTS Run",
            numberOfZones: 6,
            type: heartRateZoneCalculatorTypes.LTAndMaxHeartRate
        },
        DurataZone: {
            id: 19,
            label: "Durata Training",
            numberOfZones: 10,
            type: heartRateZoneCalculatorTypes.LactateThreshold
        },
        Linear3: {
            id: 20,
            label: "Linear",
            numberOfZones: 3,
            type: heartRateZoneCalculatorTypes.MaxAndRestingHeartRate
        },
        Linear5: {
            id: 21,
            label: "Linear",
            numberOfZones: 5,
            type: heartRateZoneCalculatorTypes.MaxAndRestingHeartRate
        },
        Linear7: {
            id: 22,
            label: "Linear",
            numberOfZones: 7,
            type: heartRateZoneCalculatorTypes.MaxAndRestingHeartRate
        }
    };

    var speedZoneCalculatorDistances = 
    {
        ThreeKm: {
            id: 1,
            label: "3 km",
            distanceInMeters: 3000
        },
        FiveKm: {
            id: 2,
            label: "5 km",
            distanceInMeters: 5000
        },
        TenKm: {
            id: 3,
            label: "10 km",
            distanceInMeters: 10000
        },
        OneHundredMeters: {
            id: 4,
            label: "100 m",
            distanceInMeters: 100
        },
        OneThousandMeters: {
            id: 5,
            label: "1000 m swim",
            distanceInMeters: 1000
        },
        OneThousandYards: {
            id: 6,
            label: "1000 y swim",
            distanceInMeters: 914.4
        }
    };

    var speedZoneCalculatorTypes = 
    {
        DistanceTime: 1,
        Threshold: 2,
        SecondsPer100m: 3
    };

    var speedZoneCalculators = 
    {
        FrielRunningFromTestDistance: {
            id: 1,
            label: "Joe Friel for Running",
            numberOfZones: 7,
            type: speedZoneCalculatorTypes.DistanceTime,
            distances: [
                speedZoneCalculatorDistances.FiveKm,
                speedZoneCalculatorDistances.TenKm
            ]
        },
        FrielRunningFromThresholdSpeed: {
            id: 2,
            label: "Joe Friel for Running",
            numberOfZones: 7,
            type: speedZoneCalculatorTypes.Threshold
        },
        FrielSwimmingFromTestDistance: {
            id: 3,
            label: "Joe Friel for Swimming",
            numberOfZones: 7,
            type: speedZoneCalculatorTypes.DistanceTime,
            distances: [
                speedZoneCalculatorDistances.OneThousandMeters,
                speedZoneCalculatorDistances.OneThousandYards
            ]
        },
        PZIFromTestDistance: {
            id: 4,
            label: "PZI",
            numberOfZones: 10,
            type: speedZoneCalculatorTypes.DistanceTime,
            distances: [
                speedZoneCalculatorDistances.ThreeKm,
                speedZoneCalculatorDistances.FiveKm,
                speedZoneCalculatorDistances.TenKm
            ]
        },
        PZIFromThresholdSpeed: {
            id: 5,
            label: "PZI",
            numberOfZones: 10,
            type: speedZoneCalculatorTypes.Threshold
        },
        CTSFromSecondsPer100m: {
            id: 6,
            label: "CTS",
            numberOfZones: 5,
            type: speedZoneCalculatorTypes.SecondsPer100m,
            speeds: [
                speedZoneCalculatorTypes.OneHundredMeters
            ]
        }
    };

    var powerZoneCalculators = {
        CogganZone: {
            id: 1,
            label: "Andy Coggan",
            numberOfZones: 6
        },
        CharmichaelTrainingSystemsZone: {
            id: 2,
            label: "CTS",
            numberOfZones: 7
        },
        DurataZone: {
            id: 3,
            label: "Durata Training",
            numberOfZones: 8
        }
    };

    function indexById(zoneCalculators)
    {
        var byId = {};
        _.each(zoneCalculators, function(calculator)
        {
            byId[calculator.id] = calculator;
        });
        return byId;
    }

    return {
        heartRate: heartRateZoneCalculators,
        heartRateTypes: heartRateZoneCalculatorTypes,
        heartRatesById: indexById(heartRateZoneCalculators),
        speed: speedZoneCalculators,
        speedTypes: speedZoneCalculatorTypes,
        speedDistances: speedZoneCalculatorDistances,
        speedById: indexById(speedZoneCalculators),
        power: powerZoneCalculators,
        powerById: indexById(powerZoneCalculators)
    };

});

