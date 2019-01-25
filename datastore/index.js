const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
var Promise = require('bluebird');
const fsp = Promise.promisifyAll(fs);

var items = {};

const readFilePromise = Promise.promisify(fs.readFile);

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  var id;
  counter.getNextUniqueId((err, data) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    }
    id = data;
    items[id] = text;
    fs.appendFile(`${exports.dataDir}/${id}.txt`, text.toString(), (err) => {
      if (err) { 
        callback(new Error(`No item with id: ${id}`));
      } 
      callback(null, { id, text });
    });
  });
};

exports.readAll = (callback) => {
  // with promise
  return fsp.readdirAsync(exports.dataDir)
  .then((fileNames) => {
    var data = _.map(fileNames, (file) => {
      var id = path.basename(file, '.txt');
      var filepath = path.join(exports.dataDir, file);
      return readFilePromise(filepath).then(fileData => {
        return {
          id: id,
          text: fileData.toString()
        };
      });
    });
    Promise.all(data)
    .then(items => callback(null, items))
    .catch(err => callback(err));
  });
};

// first promise attempt

// return fsp.readdirAsync(exports.dataDir)
// .then((fileList) => {
//   var data = _.map(fileList, (fileName) => {
//     fileName = fileName.slice(0, -4);
//     Promise.all([
//       exports.readOne(fileName)
//     ])
//   })
// })
// .catch(err => {
//   reject(err);
// });

// solution
// read and send each message to my callback

//read directory => fileNames
// fs.readdir(exports.dataDir, (err, fileNames) => {
//   if (err) {
//     callback(err);
//   } else {
//     let results = [];
//     // for each file name, do readOne to get the contents
//     for (let i = 0; i < fileNames.length; i++) {
//       let id = fileNames[i].slice(0, -4);
//       exports.readOne(id, (err, contents) => {
//         if (err) {
//           callback(err);
//         } else {
//           // pass data into callback as an array of each item
//           results.push(contents);

//           if (results.length === fileNames.length) {
//             callback(err, results);
//           }
//         }
//       })
//     }
//   }
// })


    // fs.readdir(exports.dataDir, (err, todoList) => {
    //   if (err) {
    //     callback(new Error(`No item with id: ${id}`));
    //   }
    //   var data = _.map(todoList, (fileName) => {
    //     fileName = fileName.slice(0, -4);
    //     return { id: fileName, text: fileName };
    //   });
    //   callback(null, data);
    // });

exports.readOne = (id, callback) => {
  fs.readFile(`${exports.dataDir}/${id}.txt`, 'utf8', (err, todo) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, { id, text: todo });
    }
  });
};

exports.update = (id, text, callback) => {
  let verify = false;
  fs.readdir(exports.dataDir, (err, fileList) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      _.map(fileList, (fileName) => {
        fileName = fileName.slice(0, -4);
        if (fileName === id) {
          verify = true;
        }
        if (verify) {
          fs.writeFile(`${exports.dataDir}/${id}.txt`, text, 'utf8', (err) => {
            if (err) {
              callback(new Error(`No item with id: ${id}`));
            } else {
              callback(null, { id, text });
            }
          });
        } else {
          callback(new Error(`No item with id: ${id}`));
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  fs.unlink(`${exports.dataDir}/${id}.txt`, (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
