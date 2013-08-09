define(
[],
function()
{
    return {

        token:
        {
            access_token: "fakeToken",
            expires_in: 31536000,
            refresh_token: "otherFakeToken",
            scope: "fitness clientevents users athletes exerciselibrary images",
            token_type: "bearer"
        },

        athleteSettings:
        {
            barbkprem:
            {
                "userName": null,
                "birthday": null,
                "gender": null,
                "email": null,
                "address": null,
                "address2": null,
                "city": null,
                "state": null,
                "country": null,
                "zipCode": null,
                "phone": null,
                "cellPhone": null,
                "profilePhotoUrl": null,
                "age": null,
                "units": 0,
                "dateFormat": null,
                "timeZone": null,
                "heartRateZones": [{ "threshold": 110,
                    "maximumHeartRate": 160,
                    "restingHeartRate": 15,
                    "workoutTypeId": 0,
                    "zones": [{ "label": "Zone 1: Recovery",
                        "maximum": 127,
                        "minimum": 99 },
                    { "label": "Zone 2: Aerobic",
                        "maximum": 136,
                        "minimum": 128 },
                    { "label": "Zone 3: Tempo",
                        "maximum": 143,
                        "minimum": 137 },
                    { "label": "Zone 4: SubThreshold",
                        "maximum": 149,
                        "minimum": 144 },
                    { "label": "Zone 5A: SuperThreshold",
                        "maximum": 153,
                        "minimum": 150 },
                    { "label": "Zone 5B: Aerobic Capacity",
                        "maximum": 158,
                        "minimum": 154 },
                    { "label": "Zone 5C: Anaerobic Capacity",
                        "maximum": 166,
                        "minimum": 159 }] }],
                "powerZones": [{ "threshold": 110,
                    "workoutTypeId": 0,
                    "zones": [{ "label": "1",
                        "maximum": 89,
                        "minimum": 0 },
                    { "label": "2",
                        "maximum": 121,
                        "minimum": 90 },
                    { "label": "3",
                        "maximum": 145,
                        "minimum": 122 },
                    { "label": "4",
                        "maximum": 169,
                        "minimum": 146 },
                    { "label": "5",
                        "maximum": 193,
                        "minimum": 170 },
                    { "label": "6",
                        "maximum": 2000,
                        "minimum": 194 }] }],
                "speedZones": [{ "workoutTypeId": 0,
                    "zones": [] },
                { "workoutTypeId": 1,
                    "zones": [{ "label": "Zone 1",
                        "maximum": 0.819672131147541,
                        "minimum": 0.1111111111111111 },
                    { "label": "Zone 2",
                        "maximum": 0.86956521739130432,
                        "minimum": 0.819672131147541 },
                    { "label": "Zone 3",
                        "maximum": 0.93457943925233644,
                        "minimum": 0.86956521739130432 },
                    { "label": "Zone 4",
                        "maximum": 0.99009900990099009,
                        "minimum": 0.93457943925233644 },
                    { "label": "Zone 5a",
                        "maximum": 1.0309278350515465,
                        "minimum": 0.99009900990099009 },
                    { "label": "Zone 5b",
                        "maximum": 1.1111111111111112,
                        "minimum": 1.0309278350515465 },
                    { "label": "Zone 5c",
                        "maximum": 100.0,
                        "minimum": 1.1111111111111112 }] },
                { "workoutTypeId": 3,
                    "zones": [{ "label": "Zone 1",
                        "maximum": 1.73228000346456,
                        "minimum": 0.0 },
                    { "label": "Zone 2",
                        "maximum": 1.9602704039205407,
                        "minimum": 1.73228000346456 },
                    { "label": "Zone 3",
                        "maximum": 2.1100288042200575,
                        "minimum": 1.9602704039205407 },
                    { "label": "Zone 4",
                        "maximum": 2.2352000044704,
                        "minimum": 2.1100288042200575 },
                    { "label": "Zone 5a",
                        "maximum": 2.3089616046179229,
                        "minimum": 2.2352000044704 },
                    { "label": "Zone 5b",
                        "maximum": 2.4900128049800259,
                        "minimum": 2.3089616046179229 },
                    { "label": "Zone 5c",
                        "maximum": 1609.344,
                        "minimum": 2.4900128049800259 }] }]
            }

        },

        users:
        {
            barbkprem:
            {
                "userId": 426489,
                "firstName": "Barbara prem",
                "lastName":"Kauffman",
                "userName":"barbkprem",
                "birthday":"1966-07-26T00:00:00",
                "gender":null,
                "email":"barbara@peaksware.com",
                "address":null,
                "address2":null,
                "city":"fort lupton",
                "state":"CO",
                "country":"",
                "zipCode":"",
                "phone":null,
                "cellPhone":null,
                "profilePhotoUrl":"/TPWebServices/GetImageFile.aspx?t=db&i=502e9e5717044a137867e211&f=426489_1255469787_17_8_2012.jpg",
                "age":46,
                "units":1,
                "dateFormat":"mdy",
                "timeZone":"US/Mountain",
                "story":"Here is my profile information",
                "longitude":null,
                "latitude":null,
                "language":"en-us",
                "settings":
                {
                    "account":
                        {
                            "accessGroupIds": [999999],
                            "affiliateId":596,
                            "allowMarketingEmails":false,
                            "enablePrivateMessageNotifications":false,
                            "expirationDate":"2014-11-27T15:19:00",
                            "headerImageUrl":"/TPWebServices/GetImageFile.aspx?t=db&i=4fda2babbc3fc714fc11de99&f=training_peaks_banner.png",
                            "headerLink": "http://www.trainingpeaks.com",
                            "isAthlete": true,
                            "isCoach":false,
                            "isCoached":false,
                            "isEmailVerified":true,
                            "lastLogon":"2013-05-07T16:30:53",
                            "numberOfVisits":5464,
                            "userType":4
                        },
                    "affiliate":
                        {
                            "code":"trainingpeaks3",
                            "isTrainingPeaks":true
                        },
                    "calendar":
                        {
                            "numberOfWeeksToShow":3,
                            "showWeekSummary":true,
                            "showWorkouts":true,
                            "showMeals":true,
                            "showIcons":true,
                            "showMetrics":true,
                            "workoutColorization":1,
                            "display":1,
                            "workoutLabelLayout":[23,
                            30,
                            7,
                            31,
                            35,
                            8,
                            5]
                        },
                    dashboard: {
                        dateOptions: {
                        startDate: null,
                        endDate: null,
                        quickDateSelectOption: null
                        },
                        pods: []
                    },
                    "workout":
                        {
                            "layout":{"1":[1,2,4,5,9,10,3,12,19,17,22],"2":[1,2,3,5,6,9,10,8,11,7,13,14,15,16,17,18,20,21,22],"3":[1,2,4,5,6,9,10,7,8,3,19,13,20,14,15,16,17,18,21,22],"4":[1,2,3,4,5,6,9,10,7,8,14,19,13,22],"5":[1,2,5,9,10,13,22],"6":[1,2,13,22],"7":[1,13,22],"8":[1,2,3,5,6,9,10,8,13,4,14,22],"9":[1,5,9,10,13,22],"10":[1,2,5,9,10,13,21,22],"11":[1,2,4,5,9,10,13,21,22],"12":[1,2,4,5,6,9,10,12,11,13,17,20,15,22],"13":[1,2,4,5,6,9,10,13,22],"100":[1,2,5,9,10,13,22]}
                        },
                    "metrics": [{"type":9,
                        "public":false},
                    {"type":6,
                        "public":false},
                    {"type":10,
                        "public":true},
                    {"type":11,
                        "public":true},
                    {"type":2,
                        "public":false},
                    {"type":7,
                        "public":false},
                    {"type":3,
                        "public":false},
                    {"type":8,
                        "public":false},
                    {"type":20,
                        "public":false},
                    {"type":4,
                        "public":false},
                    {"type":5,
                        "public":false},
                    {"type":1,
                        "public":false},
                    {"type":12,
                        "public":false},
                    {"type":55,
                        "public":false},
                    {"type":53,
                        "public":false},
                    {"type":50,
                        "public":false},
                    {"type":49,
                        "public":false},
                    {"type":47,
                        "public":false},
                    {"type":48,
                        "public":false},
                    {"type":46,
                        "public":false},
                    {"type":56,
                        "public":true},
                    {"type":57,
                        "public":true},
                    {"type":51,
                        "public":true},
                    {"type":23,
                        "public":true},
                    {"type":59,
                    "public": true
                    }]
                },
                "athletes": [{
                    "athleteId": 426489,
                    "firstName":"Barbara prem",
                    "lastName":"Kauffman",
                    "athleteType":3,
                    "userType":4,
                    "category": "",
                    "lastLogin": "2013-05-07T16:30:53",
                    "lastPlannedWorkout":"3911-03-08T00:00:00",
                    "settings":null,
                    "photoUrl":"/TPWebServices/GetImageFile.aspx?t=db&i=502e9e5717044a137867e211&f=426489_1255469787_17_8_2012.jpg"}
                ]
            }, // END BARBKPREM

            supercoach:
            {
                "userId": 12345678,
                "firstName": "Super",
                "lastName": "Coach",
                "userName": "supercoach",
                "birthday":"1966-07-26T00:00:00",
                "gender":null,
                "email":"coach@peaksware.com",
                "address":null,
                "address2":null,
                "city":"fort lupton",
                "state":"CO",
                "country":"",
                "zipCode":"",
                "phone":null,
                "cellPhone":null,
                "profilePhotoUrl":"/TPWebServices/GetImageFile.aspx?t=db&i=502e9e5717044a137867e211&f=426489_1255469787_17_8_2012.jpg",
                "age":46,
                "units": 1,
                "dateFormat": "mdy",
                "timeZone":"US/Mountain",
                "story":"Here is my profile information",
                "longitude":null,
                "latitude":null,
                "language":"en-us",
                "settings":
                {
                    "account":
                        {
                            "accessGroupIds": [999999],
                            "affiliateId":596,
                            "allowMarketingEmails":false,
                            "enablePrivateMessageNotifications":false,
                            "expirationDate":"2014-11-27T15:19:00",
                            "headerImageUrl":"/TPWebServices/GetImageFile.aspx?t=db&i=4fda2babbc3fc714fc11de99&f=training_peaks_banner.png",
                            "headerLink": "http://www.trainingpeaks.com",
                            "isAthlete": false,
                            "isCoach": true,
                            "isCoached":false,
                            "isEmailVerified":true,
                            "lastLogon":"2013-05-07T16:30:53",
                            "numberOfVisits":5464,
                            "userType":4
                        },
                    "affiliate":
                        {
                            "code":"trainingpeaks3",
                            "isTrainingPeaks":true
                        },
                    "calendar":
                        {
                            "numberOfWeeksToShow":3,
                            "showWeekSummary":true,
                            "showWorkouts":true,
                            "showMeals":true,
                            "showIcons":true,
                            "showMetrics":true,
                            "workoutColorization":1,
                            "display":1,
                            "workoutLabelLayout":[23,
                            30,
                            7,
                            31,
                            35,
                            8,
                            5]
                        },
                    "workout":
                        {
                            "layout":{"1":[1,2,4,5,9,10,3,12,19,17,22],"2":[1,2,3,5,6,9,10,8,11,7,13,14,15,16,17,18,20,21,22],"3":[1,2,4,5,6,9,10,7,8,3,19,13,20,14,15,16,17,18,21,22],"4":[1,2,3,4,5,6,9,10,7,8,14,19,13,22],"5":[1,2,5,9,10,13,22],"6":[1,2,13,22],"7":[1,13,22],"8":[1,2,3,5,6,9,10,8,13,4,14,22],"9":[1,5,9,10,13,22],"10":[1,2,5,9,10,13,21,22],"11":[1,2,4,5,9,10,13,21,22],"12":[1,2,4,5,6,9,10,12,11,13,17,20,15,22],"13":[1,2,4,5,6,9,10,13,22],"100":[1,2,5,9,10,13,22]}
                        },
                    "metrics": [{"type":9,
                        "public":false},
                    {"type":6,
                        "public":false},
                    {"type":10,
                        "public":true},
                    {"type":11,
                        "public":true},
                    {"type":2,
                        "public":false},
                    {"type":7,
                        "public":false},
                    {"type":3,
                        "public":false},
                    {"type":8,
                        "public":false},
                    {"type":20,
                        "public":false},
                    {"type":4,
                        "public":false},
                    {"type":5,
                        "public":false},
                    {"type":1,
                        "public":false},
                    {"type":12,
                        "public":false},
                    {"type":55,
                        "public":false},
                    {"type":53,
                        "public":false},
                    {"type":50,
                        "public":false},
                    {"type":49,
                        "public":false},
                    {"type":47,
                        "public":false},
                    {"type":48,
                        "public":false},
                    {"type":46,
                        "public":false},
                    {"type":56,
                        "public":true},
                    {"type":57,
                        "public":true},
                    {"type":51,
                        "public":true},
                    {"type":23,
                        "public":true},
                    {"type":59,
                    "public": true
                    }]
                },
                "athletes": [
                    {
                        "athleteId": 12345,
                        "firstName": "Athlete",
                        "lastName": "One",
                        "athleteType": 3,
                        "userType": 4,
                        "category": "",
                        "lastLogin": "2013-05-07T16:30:53",
                        "lastPlannedWorkout": "3911-03-08T00:00:00",
                        "settings": null,
                        "photoUrl": "/TPWebServices/GetImageFile.aspx?t=db&i=502e9e5717044a137867e211&f=426489_1255469787_17_8_2012.jpg"
                    },
                    {
                    "athleteId": 23456,
                    "firstName":"Another",
                    "lastName":"Athlete",
                    "athleteType":3,
                    "userType":4,
                    "category": "",
                    "lastLogin": "2013-05-07T16:30:53",
                    "lastPlannedWorkout":"3911-03-08T00:00:00",
                    "settings":null,
                    "photoUrl":"/TPWebServices/GetImageFile.aspx?t=db&i=502e9e5717044a137867e211&f=426489_1255469787_17_8_2012.jpg"}
                ]
            } // END SUPERCOACH

        },

        trainingPlans: [

            {
                planId: 1,
                title: "Training Plan One"
            },
            {
                planId: 2,
                title: "Training Plan Two"
            },
            {
                planId: 3,
                title: "Training Plan Three",
            }

        ],

        trainingPlanDetails: {
            author: "Some Guy",
            dayCount: 365,
            description: "Description of a training plan",
            eventDate: "2013-12-25",
            eventName: "Christmas Run",
            eventPlan: true,
            workoutCount: 1,
            planId: 3, 
            plannedWorkoutTypeDurations: [],
            title: "Training Plan Three",
            planApplications: [
                {
                    appliedPlanId: 21,
                    startDate: "2013-01-02",
                    endDate: "2013-09-10"
                },
                {
                    appliedPlanId: 22,
                    startDate: "2014-01-02",
                    endDate: "2014-09-10"
                }
            ],
        } 
        
    };

});