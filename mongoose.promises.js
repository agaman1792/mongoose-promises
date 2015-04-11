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

        // ============= Version definition
        self._VERSION = "0.0.6";

        // ============= Get
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
                        message: "Object not found or empty"
                    });
                }

                deferred.resolve(data);
            });

            return deferred.promise;
        };

        // ============= Count
        self.Count = function(filter) {
            var deferred = Q.defer();
            filter = filter || {};

            Model.Count(filter, function(err, count){
                if (err) {
                    return deferred.reject({
                        status: "failed",
                        message: err.message
                    });
                }

                deferred.resolve({
                    status: "ok",
                    count: count
                });
            });

            return deferred.promise;
        };

        // ============= Update
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

        // ============= Save
        self.Save = function(attrs) {
            var deferred = Q.defer();
            attrs = attrs || {};

            var item = new Model(attrs);
            item.save(function(err) {
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

        self.SaveBulk = function(documents) {
            var deferred = Q.defer();

            if (documents === undefined) {
                return deferred.reject({
                    status: "failed",
                    message: "Documents not specified"
                });
            }

            Model.collection.insert(documents, function(err, docs){
                if (err) {
                    return deferred.reject({
                        result: "failed",
                        message: err.message
                    });
                }

                deferred.resolve({
                    result: "ok",
                    added: docs.ops.length
                });
            });

            return deferred.promise;
        };

        // ============= Remove
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

    // ============= Export
    module.exports = function(module) {
        return new PromisesModule(module);
    };

}());