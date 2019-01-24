const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  var id;
  counter.getNextUniqueId((err, data) => {
    if (err) {
      throw err;
    }
    id = data;
    items[id] = text;
    fs.appendFile(`${exports.dataDir}/${id}.txt`, text.toString(), (err) => {
      if (err) { 
        throw err; 
      } 
      callback(null, { id, text });
    });
  });
};

exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, (err, todoList) => {
    if (err) {
      throw err;
    }
    var data = _.map(todoList, (fileName) => {
      fileName = fileName.slice(0, -4);
      return { id: fileName, text: fileName };
    });
    callback(null, data);
  });
};

exports.readOne = (id, callback) => {
// fs.readdir(exports.dataDir, (err, todoList))

  var text = items[id];
  if (!text) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback(null, { id, text });
  }
};

exports.update = (id, text, callback) => {
  var item = items[id];
  if (!item) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    items[id] = text;
    callback(null, { id, text });
  }
};

exports.delete = (id, callback) => {
  var item = items[id];
  delete items[id];
  if (!item) {
    // report an error if item not found
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback();
  }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
