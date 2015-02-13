// BEGIN FILE:  awe_v8.js
/*

  The MIT License

  Copyright (c) 2013 Rob Manson, http://buildAR.com. All rights reserved.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.


  What is awe_v8.js?
  ------------------

    It's a simple datastore template that makes it easy to store, manage and
    extend collections of javascript object in a consistent way. 

    Trust me, it's funkier than that sounds! 8)


  Why is it called awe_v8?
  -----------------------

    Each datastore by default is designed to support a standard set of "8 verbs".

    - search
    - list
    - add
    - view
    - edit
    - update
    - delete
    - report

    Through the magical process of simplification this translates in a subset of
    "6 implemented methods".

    - list
    - add
    - view
    - update
    - delete
    - report

    search and edit are simply UIs that drive one of these 6 methods.

      e.g. edit -> update or search -> list


  How are errors handled?
  -----------------------

    In simple js mode a method call either returns undefined for an error or
    either an object or an array of 0 or more objects.


  How do you use awe_v8? 
  ----------------------

  // create a awe_v8 datastore
  var my_datastore = new awe_v8();

  // add one object to your datastore
  console.log("add an object (return new id)");
  my_datastore.add({
    id: "test",
    some_data: "blah"
  });

  // add multiple objects to your datastore in one go
  console.log("add several objects (return new ids)");
  my_datastore.add([
    {
      id: "test2",
      some_data: "blahdeblah"
    },
    {
      new_param: 99, 
      id: "test3",
      some_data: "hrmok"
    },
  ]);

  // list all objects currently in your datastore
  console.log("list all objects (return all objects)");
  my_datastore.list(); 

  // list all objects in SOAPjr format (see separate documentation for SOAPjr API)
  console.log("list all objects (return all objects in SOAPjr)");
  my_datastore.list({}, { output_format:"soapjr" }); 

  // view one object
  console.log("view an object (return one object)");
  my_datastore.view("test"); // simple
  my_datastore.view({ id: "test" }); // clear
  my_datastore.view({ id: "test" }, { output_format:"js" }); // explicit

  // update one object
  console.log("update an object (return updated fields)");
  my_datastore.update({
    data: {
      new_param: 34, 
      some_data: "new_data",
    }, 
    where: {
      id: "test",
    }
  });

  // search for objects that fuzzy match a pattern
  console.log("list fuzzy matches (return roughly matching objects)");
  my_datastore.list({ id: "test" }, { limit: 10 }); 

  // search for objects that exactly match a pattern
  console.log("list exact matches (return exactly matching objects)");
  my_datastore.list({ exact: { id: "test2" } }); 

  // delete one object
  console.log("delete an object (return deleted ids)");
  my_datastore.delete({ id: "test2" }); 

  // report metadata about this datastore
  console.log("report overview info (return a summary)");
  my_datastore.report();

*/

// override this to customise how you want your awe_v8 template to behave
var V8_CONFIG = {
  default_id_field: "id",
  default_output_format: "js",
  debug: false,
};

// below here is the template awe_v8 object implementation
function awe_v8() {
  var ID_FIELD = "id";
  try {
    if (V8_CONFIG.default_id_field !== undefined) {
      ID_FIELD = V8_CONFIG.default_id_field;
    }
  }
  catch(e) { /* TODO */ }
  var OUTPUT_FORMAT = "js";
  try {
    if (V8_CONFIG.default_output_format !== undefined) {
      OUTPUT_FORMAT = V8_CONFIG.default_output_format;
    }
  }
  catch(e) { /* TODO */ }
  var awe_v8_object = new awe_v8_template();
  var _return = function(return_flag, return_values, errors, output_format) {
    if (output_format === undefined) {
      output_format = OUTPUT_FORMAT;
    }
    if (output_format == "soapjr") {
      var return_object = {
        HEAD: {},
        BODY: []
      };
      if (return_flag) {
        if (typeof(return_values) === "object" && return_values.length !== undefined) {
          return_object.BODY = return_values;
        }
        else {
          return_object.BODY = [return_values];
        }
        return_object.HEAD.result = 1;
        return return_object;
      }
      else {
        return_object.HEAD.result = 0;
        if (errors !== undefined && Object.keys(errors).length) {
          for (var i in errors) {
            if (Object.keys(errors[i]).length) {
              
              return_object.HEAD.errors[i] = errors[i];
            }
          }
        }
        return return_object;
      }
    }
    else {
      if (return_flag) {
        return return_values;
      }
      else {
        return undefined;
      }
    }
  };
  function _add(data, io, errors) {
    if (io == undefined) {
      throw "io undefined";
    }
    if (data[io[ID_FIELD]] !== undefined) {
      errors.BODY[ID_FIELD] = {
        code: 500,
        message: ID_FIELD+" already exists ("+io[ID_FIELD]+")", 
      };
      throw ID_FIELD+" already exists ("+io[ID_FIELD]+")";
    }
    else {
      data[io[ID_FIELD]] = io;
      return io[ID_FIELD];
    }
  };
  function awe_v8_template() { 
    var data = {};
    if (V8_CONFIG.debug !== undefined) {
      this.debug = V8_CONFIG.debug;
    }
    else {
      this.debug = false;
    }
    if (V8_CONFIG.debug_verbose !== undefined) {
      this.debug_verbose = V8_CONFIG.debug;
    }
    else {
      this.debug_verbose = 0;
    }
    this.get_data = function(){
      return data;
    }
    
    this.constructor.prototype.list = function(BODY, HEAD){
      if (BODY === undefined) { BODY = {}; }
      if (HEAD === undefined) { HEAD = {}; }
      var return_values = [];
      var return_flag = true;
      var errors = { HEAD:{}, BODY:{} };
      var output_format = undefined;
      if (HEAD !== undefined && HEAD.output_format !== undefined) {
        output_format = HEAD.output_format;
      }
      try {
        var page = 0;
        var limit = undefined;
        var order_by = ID_FIELD;
        var order_type = "alphabetic";
        var order_direction = "asc";
        var data_array = [];  
        for (var i in data) {
          data_array.push(data[i]);
        }
        if (HEAD !== undefined) {
          if (HEAD.page !== undefined && typeof(HEAD.page) == "number") {
            page = HEAD.page-1;
          }
          if (HEAD.limit !== undefined && typeof(HEAD.limit) == "number") {
            limit = HEAD.limit;
          }
          if (HEAD.order_by !== undefined && typeof(HEAD.order_by) == "string") {
            order_by = HEAD.order_by;
          }
          if (HEAD.order_type !== undefined && HEAD.order_type == "numeric") {
            order_type = "numeric";
          }
          if (HEAD.order_direction !== undefined && HEAD.order_direction == "desc") {
            order_direction = "desc";
          }
        }
        var sort_function = function(A, B) {
          var a = undefined;
          var b = undefined;
          if (order_type == "alphabetic") {
            if (A[order_by] !== undefined && typeof(A[order_by]) == "string") {
              a = A[order_by].toLowerCase();
            }
            if (B[order_by] !== undefined && typeof(B[order_by]) == "string") {
              b = B[order_by].toLowerCase();
            }
            if (order_direction == "asc") {
              if (a == undefined && b !== undefined) {
                return 0;
              }
              else if (a == undefined) {
                return 1;
              }
              else if (b == undefined) {
                return -1
              }
              else {
                if (a < b) {
                  return -1;
                }
                else if (a > b) {
                  return 1;
                }
                else {
                  return 0;
                }
              }
            }
            else {
              if (a == undefined && b !== undefined) {
                return 0;
              }
              else if (a == undefined) {
                return -1;
              }
              else if (b == undefined) {
                return 1
              }
              else {
                if (a > b) {
                  return -1;
                }
                else if (a < b) {
                  return 1;
                }
                else {
                  return 0;
                }
              }
            }
          }
          else {
            if (A[order_by] !== undefined && typeof(A[order_by]) == "number") {
              a = A[order_by];
            } 
            if (B[order_by] !== undefined && typeof(B[order_by]) == "number") {
              b = B[order_by];
            } 
            if (order_direction == "asc") {
              if (a == undefined && b == undefined) {
                return 0
              }
              else if (a == undefined) {
                return 1;
              }
              else if (b == undefined) {
                return -1;
              }
              else {
                return a-b; 
              }
            }
            else {
              if (a == undefined && b == undefined) {
                return 0
              }
              else if (a == undefined) {
                return 1;
              }
              else if (b == undefined) {
                return -1;
              }
              else {
                return b-a; 
              }
            }
          }
        };
        for (var i in data_array) {
          if (BODY == undefined || BODY.length == 0) {
            return_values.push(data_array[i]);
          }
          else if (BODY !== undefined && BODY.exact !== undefined) {
            var a = undefined;
            var b = undefined;
            var match = 0;
            for (var m in BODY.exact) {
              a = data_array[i][m];
              b = BODY.exact[m];
              if (a == b) {
                match = 1;
              }
            }
            if (match) {
              return_values.push(data_array[i]);
            }
          }
          else {
            var match = 1;
            for (var m in BODY) {
              if (data_array[i][m] !== undefined && typeof(data_array[i][m]) == "string") {
                a = data_array[i][m].toLowerCase();
              }
              if (BODY[m] !== undefined && typeof(BODY[m]) == "string") {
                b = BODY[m].toLowerCase();
              }
              if (a !== undefined && b !== undefined) {
                var r = a.match(b);
                if (r == undefined) { 
                  match = 0;
                }
              }
              else {
                match = 0;
              }
            }
            if (match) {
              return_values.push(data_array[i]);
            }
          }
        }
        return_values = return_values.sort(sort_function);
        if (limit !== undefined) {
          var start = limit*page;
          var end = limit*(page+1);
          return_values = return_values.slice(start,end);
        }
      }
      catch(e) {
        this.error_handler(e);
        return_flag = false;
      }
      /* NOTE: commented out to make it more forgiving - maybe move to config
      if (!(return_values.length > 0)) {
        return_flag = false;
        errors.BODY.io = {
          code: 500,
          message: "object does not exist",
        };
      }
      */
      return _return(return_flag, return_values, errors, output_format);
    };

    this.constructor.prototype.add = function(BODY, HEAD) {
      if (BODY == undefined) { BODY = {}; }
      if (HEAD == undefined) { HEAD = {}; }
      var return_values = [];
      var return_flag = true;
      var errors = { HEAD:{}, BODY:{} };
      var output_format = undefined;
      if (HEAD !== undefined) {
        if (HEAD.output_format !== undefined) {
          output_format = HEAD.output_format;
        }
        if (HEAD.replace_all !== undefined && HEAD.replace_all) {
          data = {};
        }
      }
      try {
        /* NOTE: commented out to make it more forgiving - maybe move to config
        if (BODY == undefined) {
          errors.BODY = {
            code: 500,
            message: "BODY object invalid (undefined)",
          };
          throw "BODY object invalid (undefined)";
        }
        */
        if (typeof(BODY) == "string") {
          errors.BODY = {
            code: 500,
            message: "BODY object invalid (string)",
          };
          throw "BODY object invalid (string)";
        }
        if (typeof(BODY) == "number") {
          errors.BODY = {
            code: 500,
            message: "BODY object invalid (number)",
          };
          throw "BODY object invalid (number)";
        }
        if ((Array.isArray && Array.isArray(BODY)) || (BODY[ID_FIELD] == undefined && BODY.length > 0)) {
          for (var i in BODY) {
            var a = _add(data, BODY[i], errors);
            if (a) {
              return_values.push(a); // if this fails will it still push something? yes, undefined
            }
            else {
              throw "add failed";
            }
          }
        }
        else {
          var a = _add(data, BODY, errors)
          if (a) {
              return_values.push(a); // if this fails will it still push something? yes, undefined
          }
          else {
            throw "add failed";
          }
        }
      }
      catch(e) {
        this.error_handler(e);
        return_flag = false;
      }
      if (return_values.length == 0) {
        return _return(return_flag, {}, errors, output_format);
      }
      else if (return_values.length == 1) {
        return _return(return_flag, { id: return_values[0] }, errors, output_format);
      }
      else {
        return _return(return_flag, { id: return_values }, errors, output_format);
      }
    };

    this.constructor.prototype.view = function(BODY, HEAD) {
      if (BODY == undefined) { BODY = {}; }
      if (HEAD == undefined) { HEAD = {}; }
      var return_value = undefined;
      var return_flag = true;
      var errors = { HEAD:{}, BODY:{} };
      var output_format = undefined;
      if (HEAD !== undefined && HEAD.output_format !== undefined) {
        output_format = HEAD.output_format;
      }
      try {
        if (typeof(BODY) == "string" && data[BODY] !== undefined) {
          return data[BODY].hasOwnProperty('value') ? data[BODY].value : data[BODY];
        }
        else if (BODY !== undefined && BODY.id !== undefined && data[BODY.id]) {
          return_value = data[BODY.id].hasOwnProperty('value') ? data[BODY.id].value : data[BODY.id];
        }
        else {
          errors.BODY.id = {
            code: 500,
            message: BODY.id+" does not exist", 
          };
          throw BODY.id+" does not exist";
        }
      }
      catch(e) {
        this.error_handler(e);
        return_flag = false;
      }
      return _return(return_flag, return_value, errors);
    };

    this.constructor.prototype.update = function(BODY, HEAD) {
      if (BODY == undefined) { BODY = {}; }
      if (HEAD == undefined) { HEAD = {}; }
      var return_values = HEAD.fields_updated || [];
      var return_flag = true;
      var errors = { HEAD:{}, BODY:{} };
      var output_format = undefined;
      if (HEAD !== undefined && HEAD.output_format !== undefined) {
        output_format = HEAD.output_format;
      }
      try {
        if (BODY == undefined) {
          errors.BODY = {
            code: 500,
            message: "missing BODY object", 
          };
          throw "missing BODY object";
        }
        if (BODY.data == undefined) {
          errors.BODY.data = {
            code: 500,
            message: "missing 'data' clause in BODY object", 
          };
          throw "missing 'data' clause in BODY object";
        }
        if (BODY.where == undefined) {
          errors.BODY.where = {
            code: 500,
            message: "missing 'where' clause in BODY object", 
          };
          throw "missing 'where' clause in BODY object";
        }
        if (BODY.where[ID_FIELD] !== undefined) {
          if (HEAD.strict) {
            if (data[BODY.where[ID_FIELD]] == undefined) {
              errors.BODY[BODY.where[ID_FIELD]] = {
                code: 500,
                message: ID_FIELD+" doesn't exist ("+BODY.where[ID_FIELD]+")", 
              };
              throw ID_FIELD+" doesn't exist ("+BODY.where[ID_FIELD]+")";
            }
          }
          for (var i in BODY.data) {
            if (i != ID_FIELD) {
              if (!data[BODY.where[ID_FIELD]]) {
                data[BODY.where[ID_FIELD]] = {};
                data[BODY.where[ID_FIELD]][ID_FIELD] = BODY.where[ID_FIELD];
              }
              data[BODY.where[ID_FIELD]][i] = BODY.data[i];
              return_values.push(i);
            }
          }
        }
        else {
          errors.BODY.where = {
            code: 500,
            message: "where."+ID_FIELD+" required", 
          };
          throw "where."+ID_FIELD+" required";
        }
      }
      catch(e) {
        this.error_handler(e);
        return_flag = false;
      }
      return _return(return_flag, { fields_updated: return_values }, errors, output_format);
    };

    this.constructor.prototype.delete = function(BODY, HEAD) {
      if (BODY == undefined) { BODY = {}; }
      if (HEAD == undefined) { HEAD = {}; }
      var return_values = [];
      var return_flag = true;
      var errors = { HEAD:{}, BODY:{} };
      var output_format = undefined;
      if (HEAD !== undefined && HEAD.output_format !== undefined) {
        output_format = HEAD.output_format;
      }
      try {
        if (BODY !== undefined && typeof(BODY.id) == "string" || typeof(BODY.id) == "number") {
          if (BODY !== undefined && data[BODY.id] !== undefined) {
            delete(data[BODY.id]);
            return_values.push(BODY.id);
          }
          else {
            errors.BODY.id = {
              code: 500,
              message: BODY.id+" does not exist", 
            };
            throw BODY.id+" does not exist";
          }
        }
        else {
          for (var id in BODY.id) {
            if (BODY.id[id] !== undefined && data[BODY.id[id]] !== undefined) {
              delete(data[BODY.id[id]]);
              return_values.push(BODY.id[id]);
            }
            else {
              errors.BODY[BODY.id[id]] = {
                code: 500,
                message: BODY.id[id]+" does not exist" 
              };
              throw BODY.id[id]+" does not exist";
            }
          }
        }
      }
      catch(e) {
        this.error_handler(e);
        return_flag = false;
      }
      if (return_values.length == 0) {
        return _return(return_flag, {}, errors, output_format);
      }
      else if (return_values.length == 1) {
        return _return(return_flag, { id: return_values[0] }, errors, output_format);
      }
      else {
        return _return(return_flag, { id: return_values }, errors, output_format);
      }
    };

    this.constructor.prototype.report = function(BODY, HEAD) {
      if (BODY == undefined) { BODY = {}; }
      if (HEAD == undefined) { HEAD = {}; }
      var return_value = {
        count: 0,
        fields: {},
      };
      var return_flag = true;
      var errors = { HEAD:{}, BODY:{} };
      var output_format = undefined;
      if (HEAD !== undefined && HEAD.output_format !== undefined) {
        output_format = HEAD.output_format;
      }
      try {
        if (data == undefined) {
          errors.HEAD.data = {
            code: 500,
            message: "internal data invalid" 
          };
          throw "internal data invalid";
        }
        for (var i in data) {
          for (var k in data[i]) {
            if (return_value.fields[k] == undefined) {
              return_value.fields[k] = 1;
            }
            else {
              return_value.fields[k]++;
            }
          }
          return_value.count++;
        }
      }
      catch(e) {
        this.error_handler(e);
        return_flag = false;
      }
      return _return(return_flag, return_value, errors, output_format);
    };


    this.constructor.prototype.error_handler = function(e, debug) {
      if (debug || this.debug) {
        if (e.code && e.message) {
          console.log("ERROR: "+e.code);
          console.log(e.message);
        }
        else {
          console.log("ERROR");
          console.log(e);
        }
        if (this.debug_verbose > 0) {
          console.log("CALLER");
          console.log(arguments.callee.caller);
        }
        if (this.debug_verbose > 2) {
          console.log(arguments.callee.caller.toString());
        }
      }
    };
    
    this.constructor.prototype.toString = function() {
    	return 'awe_v8_object'
    };

    return this;
  };
  return awe_v8_object;
}
// END FILE:  awe_v8.js
