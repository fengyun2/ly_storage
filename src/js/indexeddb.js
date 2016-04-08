// indexeddb.js

/**
  用法:
  (function ($, Modernizr, app) {

 	if(!Modernizr.indexeddb){
        $('#unsupported-message').show();
        $('#ui-container').hide();
        return;
    }
 	app.db.get(id, function (note) {
        $titleText.val(note.title);
        $notesText.val(note.text);
        $idHidden.val(note.id);
    });

    app.db.delete(id, function(){
        app.db.getAll(bindData);
        clearUI();
    });

    app.db.save(note, function(){
        app.db.getAll(bindData);
        clearUI();
    });

    app.db.deleteAll(function () {
        $listContainer.html('');
        addNoTasksMessage();
        clearUI();
    });
  }(jQuery, Modernizr, window.app));

 */



;

window.indexedDB = window.indexedDB ||
                   window.mozIndexedDB ||
                   window.webkitIndexedDB ||
                   window.msIndexedDB;

window.IDBTransaction = window.IDBTransaction ||
                   window.webkitIDBTransaction ||
                   window.msIDBTransaction;

window.IDBKeyRange = window.IDBKeyRange ||
                   window.webkitIDBKeyRange ||
                   window.msIDBKeyRange;

(function(window){

    'use strict';

    var db = {

        version: 1, // important: only use whole numbers!

        objectStoreName: 'tasks',

        instance: {},

        upgrade: function (e) {

            var
                _db = e.target.result,
                names = _db.objectStoreNames,
                name = db.objectStoreName;

            if (!names.contains(name)) {

                _db.createObjectStore(
                    name,
                    {
                        keyPath: 'id',
                        autoIncrement: true
                    });
            }
        },

        errorHandler: function (error) {
            window.alert('error: ' + error.target.code);
            debugger;
        },

        open: function (callback) {

            var request = window.indexedDB.open(
                db.objectStoreName, db.version);

            request.onerror = db.errorHandler;

            request.onupgradeneeded = db.upgrade;

            request.onsuccess = function (e) {

                db.instance = request.result;

                db.instance.onerror =
                    db.errorHandler;

                callback();
            };
        },

        getObjectStore: function (mode) {

            var txn, store;

            mode = mode || 'readonly';

            // 事务
            txn = db.instance.transaction(
                [db.objectStoreName], mode);

            // 得到表里的objectStore对象
            store = txn.objectStore(
                db.objectStoreName);

            return store;
        },
        /**
         * 添加或修改
         * @param  {[type]}   data     [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        save: function (data, callback) {

        	callback = callback || function(data) {
        		console.log('save success');
        	};
            db.open(function () {

                var store, request,
                    mode = 'readwrite';

                store = db.getObjectStore(mode),

                request = data.id ?
                    store.put(data) :
                    store.add(data);

                request.onsuccess = callback;
            });
        },

        getAll: function (callback) {

        	callback = callback || function(data) {
        		console.log('getAll: '+data);
        	};
            db.open(function () {

                var
                    store = db.getObjectStore(),
                    cursor = store.openCursor(),
                    data = [];

                cursor.onsuccess = function (e) {

                    var result = e.target.result;

                    if (result &&
                        result !== null) {

                        data.push(result.value);
                        result.continue();

                    } else {

                        callback(data);
                    }
                };

            });
        },

        get: function (id, callback) {
        	callback = callback || function(data) {
        		console.log('get: '+data);
        	};

            id = parseInt(id);

            db.open(function () {

                var
                    store = db.getObjectStore(),
                    request = store.get(id);

                request.onsuccess = function (e){
                    callback(e.target.result);
                };
            });
        },

        'delete': function (id, callback) {

        	callback = callback || function(data) {
        		console.log('delete success');
        	};
            id = parseInt(id);

            db.open(function () {

                var
                    mode = 'readwrite',
                    store, request;

                store = db.getObjectStore(mode);

                request = store.delete(id);

                request.onsuccess = callback;
            });
        },

        deleteAll: function (callback) {
        	callback = callback || function(data) {
        		console.log('deleteAll success');
        	};
            db.open(function () {

                var mode, store, request;

                mode = 'readwrite';
                store = db.getObjectStore(mode);
                request = store.clear();

                request.onsuccess = callback;
            });

        }
    };

    window.app = window.app || {};
    window.app.db = db;

}(window));
