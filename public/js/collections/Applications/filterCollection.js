﻿define([
    'models/ApplicationsModel',
    'common'
],
    function (ApplicationModel, common) {
        var TasksCollection = Backbone.Collection.extend({
            model: ApplicationModel,
            url: function () {
                return "/Applications/kanban/";
            },
            page: 1,
            initialize: function (options) {
                var that = this;
                var filterObject = {};
                for (var i in options) {
                    filterObject[i] = options[i];
                };
                this.fetch({
                    data: filterObject,
                    reset: true,
                    success: function() {
                        console.log("Application fetchSuccess");
                        that.page += 1;
                    },
                    error: this.fetchError
                });
            },

            showMore: function (options) {
                var that = this;
                var filterObject = {};
                if (options) {
                    for (var i in options) {
                        filterObject[i] = options[i];
                    }
                }
                filterObject['page'] = (filterObject.hasOwnProperty('page')) ? filterObject['page'] : this.page;
                filterObject['count'] = (filterObject.hasOwnProperty('count')) ? filterObject['count'] : 10;
                this.fetch({
                    data: filterObject,
                    success: function(models) {
                        that.page += 1;
                        that.trigger('add', models);
                    },
                    error: this.fetchError
                });
            },

            parse: true,
            parse: function (response) {
                if (response.data) {
                    _.map(response.data, function (application) {
                    	application.creationDate = common.utcDateToLocaleDate(application.creationDate);
                        application.createdBy.date = common.utcDateToLocaleDateTime(application.createdBy.date);
                        application.editedBy.date = common.utcDateToLocaleDateTime(application.editedBy.date);
                        return application;
                    });
                }
                return response.data;
            },

            fetchError: function (error) {
            }
        });

        return TasksCollection;
    });