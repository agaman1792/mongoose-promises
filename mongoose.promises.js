(function() {
    'use strict';

    var mongoose = require('../mongoose');
    var Q = require('q');

    var PromisesModule = function(Model) {
    	var self = this;
        if (Model === undefined) {
            return false;
        }

        // Check if the user uses mongoose in first place
        if (mongoose === undefined || mongoose === false) {
            return false;
        }

        self._VERSION = "0.0.2";

        self.Get = function(filter, numberOf) {
            filter = filter || {};

            var deferred = Q.defer();
            var promise = Model.where(filter).findOne();
            if (numberOf === undefined) {
                promise = Model.find(filter).limit(numberOf);
            }

            promise.exec(function(err, data) {
                if (err) {
                    return deferred.reject({
                        status: "failed",
                        message: err.message
                    });
                }

                data = data || {};

                if (Object.keys(data).length === 0) {
                    return deferred.reject({
                        status: "failed",
                        message: "Empty object"
                    });
                }

                deferred.resolve(data);
            });

            return deferred.promise;
        };

        self.Update = function(filter, update) {
            filter = filter || {};
            update = update || {};

            var deferred = Q.defer();
            var promise = Model.findOneAndUpdate(filter, update);

            promise.exec(function(err, data) {
                if (err) {
                    return deferred.reject({
                        status: "failed",
                        message: err.message
                    });
                }

                deferred.resolve({
                    status: "ok",
                    old: data.toJSON(),
                    "new": update
                });
            });

            return deferred.promise;
        };

        self.Save = function(attrs) {
            var deferred = Q.defer();
            attrs = attrs || {};

            var item = new Model(attrs);
            Model.save(function(err) {
                if (err) {
                    return deferred.reject({
                        status: "failed",
                        message: err.message
                    });
                }

                deferred.resolve({
                    status: "ok",
                    message: "addition successfull",
                    data: item.toJSON()
                });
            });

            return deferred.promise;
        };

        self.Remove = function(filter) {
            var deferred = Q.defer();
            
            Model.findOneAndRemove(filter).exec(function(err, data) {
                if (err) {
                    return deferred.reject({
                        status: "failed",
                        message: err.message
                    });
                }

                deferred.resolve({
                    status: "ok",
                    removed: data
                });
            });

            return deferred.promise;
        };
    };

    module.exports = function(module) {
    	return new PromisesModule(module);
    };
}());