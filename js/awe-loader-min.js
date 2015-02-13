/* MIT License */var V8_CONFIG={default_id_field:"id",default_output_format:"js",debug:false,};function awe_v8(){var ID_FIELD="id";try{if(V8_CONFIG.default_id_field!==undefined){ID_FIELD=V8_CONFIG.default_id_field;}}
catch(e){}
var OUTPUT_FORMAT="js";try{if(V8_CONFIG.default_output_format!==undefined){OUTPUT_FORMAT=V8_CONFIG.default_output_format;}}
catch(e){}
var awe_v8_object=new awe_v8_template();var _return=function(return_flag,return_values,errors,output_format){if(output_format===undefined){output_format=OUTPUT_FORMAT;}
if(output_format=="soapjr"){var return_object={HEAD:{},BODY:[]};if(return_flag){if(typeof(return_values)==="object"&&return_values.length!==undefined){return_object.BODY=return_values;}
else{return_object.BODY=[return_values];}
return_object.HEAD.result=1;return return_object;}
else{return_object.HEAD.result=0;if(errors!==undefined&&Object.keys(errors).length){for(var i in errors){if(Object.keys(errors[i]).length){return_object.HEAD.errors[i]=errors[i];}}}
return return_object;}}
else{if(return_flag){return return_values;}
else{return undefined;}}};function _add(data,io,errors){if(io==undefined){throw"io undefined";}
if(data[io[ID_FIELD]]!==undefined){errors.BODY[ID_FIELD]={code:500,message:ID_FIELD+" already exists ("+io[ID_FIELD]+")",};throw ID_FIELD+" already exists ("+io[ID_FIELD]+")";}
else{data[io[ID_FIELD]]=io;return io[ID_FIELD];}};function awe_v8_template(){var data={};if(V8_CONFIG.debug!==undefined){this.debug=V8_CONFIG.debug;}
else{this.debug=false;}
if(V8_CONFIG.debug_verbose!==undefined){this.debug_verbose=V8_CONFIG.debug;}
else{this.debug_verbose=0;}
this.get_data=function(){return data;}
this.constructor.prototype.list=function(BODY,HEAD){if(BODY===undefined){BODY={};}
if(HEAD===undefined){HEAD={};}
var return_values=[];var return_flag=true;var errors={HEAD:{},BODY:{}};var output_format=undefined;if(HEAD!==undefined&&HEAD.output_format!==undefined){output_format=HEAD.output_format;}
try{var page=0;var limit=undefined;var order_by=ID_FIELD;var order_type="alphabetic";var order_direction="asc";var data_array=[];for(var i in data){data_array.push(data[i]);}
if(HEAD!==undefined){if(HEAD.page!==undefined&&typeof(HEAD.page)=="number"){page=HEAD.page-1;}
if(HEAD.limit!==undefined&&typeof(HEAD.limit)=="number"){limit=HEAD.limit;}
if(HEAD.order_by!==undefined&&typeof(HEAD.order_by)=="string"){order_by=HEAD.order_by;}
if(HEAD.order_type!==undefined&&HEAD.order_type=="numeric"){order_type="numeric";}
if(HEAD.order_direction!==undefined&&HEAD.order_direction=="desc"){order_direction="desc";}}
var sort_function=function(A,B){var a=undefined;var b=undefined;if(order_type=="alphabetic"){if(A[order_by]!==undefined&&typeof(A[order_by])=="string"){a=A[order_by].toLowerCase();}
if(B[order_by]!==undefined&&typeof(B[order_by])=="string"){b=B[order_by].toLowerCase();}
if(order_direction=="asc"){if(a==undefined&&b!==undefined){return 0;}
else if(a==undefined){return 1;}
else if(b==undefined){return-1}
else{if(a<b){return-1;}
else if(a>b){return 1;}
else{return 0;}}}
else{if(a==undefined&&b!==undefined){return 0;}
else if(a==undefined){return-1;}
else if(b==undefined){return 1}
else{if(a>b){return-1;}
else if(a<b){return 1;}
else{return 0;}}}}
else{if(A[order_by]!==undefined&&typeof(A[order_by])=="number"){a=A[order_by];}
if(B[order_by]!==undefined&&typeof(B[order_by])=="number"){b=B[order_by];}
if(order_direction=="asc"){if(a==undefined&&b==undefined){return 0}
else if(a==undefined){return 1;}
else if(b==undefined){return-1;}
else{return a-b;}}
else{if(a==undefined&&b==undefined){return 0}
else if(a==undefined){return 1;}
else if(b==undefined){return-1;}
else{return b-a;}}}};for(var i in data_array){if(BODY==undefined||BODY.length==0){return_values.push(data_array[i]);}
else if(BODY!==undefined&&BODY.exact!==undefined){var a=undefined;var b=undefined;var match=0;for(var m in BODY.exact){a=data_array[i][m];b=BODY.exact[m];if(a==b){match=1;}}
if(match){return_values.push(data_array[i]);}}
else{var match=1;for(var m in BODY){if(data_array[i][m]!==undefined&&typeof(data_array[i][m])=="string"){a=data_array[i][m].toLowerCase();}
if(BODY[m]!==undefined&&typeof(BODY[m])=="string"){b=BODY[m].toLowerCase();}
if(a!==undefined&&b!==undefined){var r=a.match(b);if(r==undefined){match=0;}}
else{match=0;}}
if(match){return_values.push(data_array[i]);}}}
return_values=return_values.sort(sort_function);if(limit!==undefined){var start=limit*page;var end=limit*(page+1);return_values=return_values.slice(start,end);}}
catch(e){this.error_handler(e);return_flag=false;}
return _return(return_flag,return_values,errors,output_format);};this.constructor.prototype.add=function(BODY,HEAD){if(BODY==undefined){BODY={};}
if(HEAD==undefined){HEAD={};}
var return_values=[];var return_flag=true;var errors={HEAD:{},BODY:{}};var output_format=undefined;if(HEAD!==undefined){if(HEAD.output_format!==undefined){output_format=HEAD.output_format;}
if(HEAD.replace_all!==undefined&&HEAD.replace_all){data={};}}
try{if(typeof(BODY)=="string"){errors.BODY={code:500,message:"BODY object invalid (string)",};throw"BODY object invalid (string)";}
if(typeof(BODY)=="number"){errors.BODY={code:500,message:"BODY object invalid (number)",};throw"BODY object invalid (number)";}
if((Array.isArray&&Array.isArray(BODY))||(BODY[ID_FIELD]==undefined&&BODY.length>0)){for(var i in BODY){var a=_add(data,BODY[i],errors);if(a){return_values.push(a);}
else{throw"add failed";}}}
else{var a=_add(data,BODY,errors)
if(a){return_values.push(a);}
else{throw"add failed";}}}
catch(e){this.error_handler(e);return_flag=false;}
if(return_values.length==0){return _return(return_flag,{},errors,output_format);}
else if(return_values.length==1){return _return(return_flag,{id:return_values[0]},errors,output_format);}
else{return _return(return_flag,{id:return_values},errors,output_format);}};this.constructor.prototype.view=function(BODY,HEAD){if(BODY==undefined){BODY={};}
if(HEAD==undefined){HEAD={};}
var return_value=undefined;var return_flag=true;var errors={HEAD:{},BODY:{}};var output_format=undefined;if(HEAD!==undefined&&HEAD.output_format!==undefined){output_format=HEAD.output_format;}
try{if(typeof(BODY)=="string"&&data[BODY]!==undefined){return data[BODY].hasOwnProperty('value')?data[BODY].value:data[BODY];}
else if(BODY!==undefined&&BODY.id!==undefined&&data[BODY.id]){return_value=data[BODY.id].hasOwnProperty('value')?data[BODY.id].value:data[BODY.id];}
else{errors.BODY.id={code:500,message:BODY.id+" does not exist",};throw BODY.id+" does not exist";}}
catch(e){this.error_handler(e);return_flag=false;}
return _return(return_flag,return_value,errors);};this.constructor.prototype.update=function(BODY,HEAD){if(BODY==undefined){BODY={};}
if(HEAD==undefined){HEAD={};}
var return_values=HEAD.fields_updated||[];var return_flag=true;var errors={HEAD:{},BODY:{}};var output_format=undefined;if(HEAD!==undefined&&HEAD.output_format!==undefined){output_format=HEAD.output_format;}
try{if(BODY==undefined){errors.BODY={code:500,message:"missing BODY object",};throw"missing BODY object";}
if(BODY.data==undefined){errors.BODY.data={code:500,message:"missing 'data' clause in BODY object",};throw"missing 'data' clause in BODY object";}
if(BODY.where==undefined){errors.BODY.where={code:500,message:"missing 'where' clause in BODY object",};throw"missing 'where' clause in BODY object";}
if(BODY.where[ID_FIELD]!==undefined){if(HEAD.strict){if(data[BODY.where[ID_FIELD]]==undefined){errors.BODY[BODY.where[ID_FIELD]]={code:500,message:ID_FIELD+" doesn't exist ("+BODY.where[ID_FIELD]+")",};throw ID_FIELD+" doesn't exist ("+BODY.where[ID_FIELD]+")";}}
for(var i in BODY.data){if(i!=ID_FIELD){if(!data[BODY.where[ID_FIELD]]){data[BODY.where[ID_FIELD]]={};data[BODY.where[ID_FIELD]][ID_FIELD]=BODY.where[ID_FIELD];}
data[BODY.where[ID_FIELD]][i]=BODY.data[i];return_values.push(i);}}}
else{errors.BODY.where={code:500,message:"where."+ID_FIELD+" required",};throw"where."+ID_FIELD+" required";}}
catch(e){this.error_handler(e);return_flag=false;}
return _return(return_flag,{fields_updated:return_values},errors,output_format);};this.constructor.prototype.delete=function(BODY,HEAD){if(BODY==undefined){BODY={};}
if(HEAD==undefined){HEAD={};}
var return_values=[];var return_flag=true;var errors={HEAD:{},BODY:{}};var output_format=undefined;if(HEAD!==undefined&&HEAD.output_format!==undefined){output_format=HEAD.output_format;}
try{if(BODY!==undefined&&typeof(BODY.id)=="string"||typeof(BODY.id)=="number"){if(BODY!==undefined&&data[BODY.id]!==undefined){delete(data[BODY.id]);return_values.push(BODY.id);}
else{errors.BODY.id={code:500,message:BODY.id+" does not exist",};throw BODY.id+" does not exist";}}
else{for(var id in BODY.id){if(BODY.id[id]!==undefined&&data[BODY.id[id]]!==undefined){delete(data[BODY.id[id]]);return_values.push(BODY.id[id]);}
else{errors.BODY[BODY.id[id]]={code:500,message:BODY.id[id]+" does not exist"};throw BODY.id[id]+" does not exist";}}}}
catch(e){this.error_handler(e);return_flag=false;}
if(return_values.length==0){return _return(return_flag,{},errors,output_format);}
else if(return_values.length==1){return _return(return_flag,{id:return_values[0]},errors,output_format);}
else{return _return(return_flag,{id:return_values},errors,output_format);}};this.constructor.prototype.report=function(BODY,HEAD){if(BODY==undefined){BODY={};}
if(HEAD==undefined){HEAD={};}
var return_value={count:0,fields:{},};var return_flag=true;var errors={HEAD:{},BODY:{}};var output_format=undefined;if(HEAD!==undefined&&HEAD.output_format!==undefined){output_format=HEAD.output_format;}
try{if(data==undefined){errors.HEAD.data={code:500,message:"internal data invalid"};throw"internal data invalid";}
for(var i in data){for(var k in data[i]){if(return_value.fields[k]==undefined){return_value.fields[k]=1;}
else{return_value.fields[k]++;}}
return_value.count++;}}
catch(e){this.error_handler(e);return_flag=false;}
return _return(return_flag,return_value,errors,output_format);};this.constructor.prototype.error_handler=function(e,debug){if(debug||this.debug){if(e.code&&e.message){console.log("ERROR: "+e.code);console.log(e.message);}
else{console.log("ERROR");console.log(e);}
if(this.debug_verbose>0){console.log("CALLER");console.log(arguments.callee.caller);}
if(this.debug_verbose>2){console.log(arguments.callee.caller.toString());}}};this.constructor.prototype.toString=function(){return'awe_v8_object'};return this;};return awe_v8_object;}
(function(window){var this_awe;var _audio_context;if(!window.awe){function awe(){var initialized=false;this.constructor.prototype.capabilities=new awe_v8();this.constructor.prototype.settings=new awe_v8();this.settings.add([{id:'debug',value:false,},{id:'geo',value:{get_location:false,}},{id:'auto_start',value:false,},{id:'renderer',value:'webgl',},{id:'start_video_stream',value:false,},{id:'fps',value:60,},{id:'default_lights',value:[{id:'spot_light',type:'spot',color:0xFFFFFF,intensity:3,distance:1000,position:{x:0,y:300,z:100},target:{x:0,y:0,z:100},cast_shadow:true,},],},]);this.constructor.prototype.events=new awe_v8();this.constructor.prototype.events.add=function(BODY,HEAD){if(!BODY){BODY={};}
if(!HEAD){HEAD={};}
try{var result=this.constructor.prototype.add.call(this,BODY,HEAD);if(Array.isArray(result.id)){for(var i in result.id){var event_handler=this.constructor.prototype.view.call(this,result.id[i]);if(event_handler){if(!event_handler.device_types||Object.keys(event_handler.device_types).length==0||event_handler.device_types[this_awe.device_type()]){event_handler.register(event_handler.handler);}}}}
else{var event_handler=this.constructor.prototype.view.call(this,result.id);if(!event_handler.device_types||Object.keys(event_handler.device_types).length==0||event_handler.device_types[this_awe.device_type()]){event_handler.register(event_handler.handler);}}}
catch(e){this.error_handler(e);}
return result;}
this.constructor.prototype.events.delete=function(BODY,HEAD){if(!BODY){BODY={};}
if(!HEAD){HEAD={};}
if(typeof BODY=='string'||typeof BODY=='number'){event_handler=this_awe.events.view(BODY);BODY={id:BODY};}
else if(BODY.id){event_handler=this_awe.events.view(BODY.id);}
if(event_handler){event_handler.unregister(event_handler.handler);}
return this.constructor.prototype.delete.call(this,BODY,HEAD);}
this.constructor.prototype.pois=new awe_v8();this.constructor.prototype.plugins=new awe_v8();this.constructor.prototype.plugins.add=function(BODY,HEAD){if(!BODY){BODY={};}
if(!HEAD){HEAD={};}
try{var result=this.constructor.prototype.add.call(this,BODY,HEAD);if(initialized){if(Array.isArray(result.id)){for(var i in result.id){var plugin=this.constructor.prototype.view.call(this,result.id[i]);if(plugin.auto_register===undefined||plugin.auto_register===true){plugin.register(plugin.data);}}}
else{var plugin=this.constructor.prototype.view.call(this,result.id);if(plugin.auto_register===undefined||plugin.auto_register===true){plugin.register(plugin.data);}}}}
catch(e){this.error_handler(e);}
return result;}
this.constructor.prototype.plugins.delete=function(BODY,HEAD){if(!BODY){BODY={};}
if(!HEAD){HEAD={};}
if(typeof BODY=='string'||typeof BODY=='number'){plugin=this_awe.plugins.view(BODY);BODY={id:BODY};}
else if(BODY.id){plugin=this_awe.plugins.view(BODY.id);}
if(plugin){plugin.unregister(plugin.data);}
return this.constructor.prototype.delete.call(this,BODY,HEAD);}
this.constructor.prototype.error_handler=function(e,debug){if(debug||this.debug){if(e.code&&e.message){console.log('ERROR: '+e.code);console.log(e.message);}
else{console.log('ERROR');console.log(e);}
if(this.debug_verbose>0){console.log('CALLER');console.log(arguments.callee.caller);}
if(this.debug_verbose>2){console.log(arguments.callee.caller.toString());}}};this.constructor.prototype.init=function(io){if(initialized){console.log('awe was already initialized.');return;}
if(!io){io={};}
if(io.settings){for(var key in io.settings){try{if(this_awe.settings.view(key)!==undefined){this_awe.settings.update({data:{value:io.settings[key],},where:{id:key,}});}
else{this_awe.settings.add({id:key,value:io.settings[key],});}}
catch(e){}}}
if(this_awe.settings.view('debug')){this.debug=this_awe.settings.view('debug');}
else{this.debug=true;}
if(this_awe.settings.view('debug_verbose')){this.debug_verbose=this_awe.settings.view('debug_verbose');}
else{this.debug_verbose=1;}
if(io.device_type!==undefined){if(io.device_type===true){var device_type='unsupported';var ua=navigator.userAgent;if(ua.match(/ipad/i)){device_type='ipad';}
else if(ua.match(/iphone/i)){device_type='iphone';}
else if(ua.match(/android/i)){device_type='android';}
else if(ua.match(/(win|os x|linux)/i)){device_type='pc';}
this_awe.settings.update({data:{value:device_type},where:{id:'device_type'}});}
else{this_awe.settings.update({data:{value:io.device_type,},where:{id:'device_type',}});}}
this_awe.detect_capabilities(function(){var plugins=this_awe.plugins.list();for(var i in plugins){plugins[i].register(plugins[i]);}
if(io.ready){try{io.ready();}
catch(e){}}
var event=new CustomEvent('awe_ready');window.dispatchEvent(event);if(this_awe.settings.view('auto_start')){this_awe.setup_scene();}
initialized=true;});};this.constructor.prototype.detect_capabilities=function(done){var io={},asynch_count=3,defaults={ajax:false,geo:false,lat:undefined,lon:undefined,gyro:false,motion:false,audio:false,gum:false,webgl:false,css3d:false,storage:false,sockets:false};var finished=function(){asynch_count--;if(asynch_count===0){var io_array=[];for(prop in io){io_array.push({id:prop,value:io[prop]});}
this_awe.capabilities.add(io_array);if(done&&typeof(done)=='function'){done();}}};for(prop in defaults){if(!io[prop]){io[prop]=defaults[prop];}}
if(!!window.XMLHttpRequest||!!window.XMLHttpRequest2){io.ajax=true;}
if(!!navigator.geolocation){io.geo=true;if(this_awe.settings.view('geo')){if(this_awe.settings.view('geo.get_location')){navigator.geolocation.getCurrentPosition(function(position){this_awe.capabilities.update({data:{value:position.coords.latitude},where:{id:'lat'}});this_awe.capabilities.update({data:{value:position.coords.longitude},where:{id:'lon'}});});}}}
if(!!window.DeviceOrientationEvent){var s1=function(e){if(e.alpha!==null){io.gyro=true;}
window.removeEventListener('deviceorientation',s1,true);finished();}
window.addEventListener('deviceorientation',s1,true);if(this_awe.device_type()=='pc'){setTimeout(function(){if(!io.gyro){finished();}},5000);}}
else{finished();}
if(!!window.DeviceMotionEvent){var s2=function(e){if(e.acceleration!==null){io.motion=true;}
window.removeEventListener('devicemotion',s2,true);finished();}
window.addEventListener('devicemotion',s2,true);if(this_awe.device_type()=='pc'){setTimeout(function(){if(!io.motion){finished();}},5000);}}
else{finished();}
if(this_awe.util.get_user_media){io.gum=true;}
if(!!window.AudioContext){_audio_context=new AudioContext();}
else if(!!window.webkitAudioContext){_audio_context=new webkitAudioContext();}
if(_audio_context){io.audio=true;this_awe.util.audio_context=_audio_context;}
if(!!document.createElement('canvas').getContext('experimental-webgl')||!!document.createElement('canvas').getContext('webgl')){io.webgl=true;}
var tmp_div=document.createElement('div');if(tmp_div.style.WebkitTransformStyle){tmp_div.style.WebkitTransformStyle='preserve-3d';if(tmp_div.style.WebkitTransformStyle=='preserve-3d'){io.css3d=true;}}
else if(tmp_div.style.transformStyle){tmp_div.style.transformStyle='preserve-3d';if(tmp_div.style.transformStyle=='preserve-3d'){io.css3d=true;}}
if(!!window.localStorage){io.storage=true;}
if(!!window.WebSocket||!!window.MozWebSocket||!!window.WebkitWebSocket||!!window.OWebSocket||!!window.msWebSocket||!!window.KhtmlWebSocket){io.sockets=true;}
finished();};this.constructor.prototype.device_type=function(){var device_type;try{device_type=this.settings.view('device_type');}
catch(e){};return device_type;};this.constructor.prototype.ready=function(){return initialized;}
return this;};function _reset_load_file_queue(){return{error_called:false,success_called:false,queue:[],status:{},};}
var _load_file_queue=_reset_load_file_queue();function _require(io){_load_file_queue=_reset_load_file_queue();if(Array.isArray(io)){for(var obj in io){if(io[obj].capabilities&&io[obj].files){if(!io[obj].success||typeof io[obj].success!=='function'){io[obj].success=function(){}}
if(!io[obj].error||typeof io[obj].error!=='function'){io[obj].error=function(){console.log('required scripts load failed');}}
if(Array.isArray(io[obj].capabilities)){var requirements_valid=true;for(var test in io[obj].capabilities){if(!this_awe.capabilities.view(io[obj].capabilities[test])){requirements_valid=false;}}
if(requirements_valid){if(Array.isArray(io[obj].files)){_load_file_queue.queue=io[obj].files;_load_file_queue.success=io[obj].success;_load_file_queue.error=io[obj].error;_process_load_file_queue();}
else{_load_file('script',{src:io[obj].files},io[obj].success,io[obj].error);}
break;}}
else{throw'require is not an array';}}}}}
function _process_load_file_queue(){var is_loading=_is_loading();if(is_loading.failed){if(!_load_file_queue.error_called){_load_file_queue.error_called=true;try{_load_file_queue.error();}
catch(e){}
_load_file_queue=_reset_load_file_queue();}
return;}
else if(!is_loading.loading){if(Array.isArray(_load_file_queue.queue)&&_load_file_queue.queue.length>0){if(Array.isArray(_load_file_queue.queue[0])){for(var f in _load_file_queue.queue[0]){var file=_load_file_queue.queue[0][f];_load_file_queue.status[file]=0
_load_file('script',{src:file},function(e){var file=this.getAttribute("src");_load_file_queue.status[file]=1;_process_load_file_queue();},function(e){var file=this.getAttribute("src");_load_file_queue.status[file]=-1;_process_load_file_queue();});}
_load_file_queue.queue.splice(0,1);}
else{var file=_load_file_queue.queue[0];_load_file_queue.queue.splice(0,1);_load_file_queue.status[file]=0;_load_file('script',{src:file},function(e){var file=this.getAttribute("src");_load_file_queue.status[file]=1;_process_load_file_queue();},function(e){var file=this.getAttribute("src");_load_file_queue.status[file]=-1;_process_load_file_queue();});}
var is_loading=_is_loading();if(is_loading.failed){if(!_load_file_queue.error_called){_load_file_queue.error_called=true;try{_load_file_queue.error();}
catch(e){}
_load_file_queue=_reset_load_file_queue();}}}
else{if(!_load_file_queue.success_called){_load_file_queue.success_called=true;try{_load_file_queue.success();}
catch(e){}
_load_file_queue=_reset_load_file_queue();}}}}
function _is_loading(){var loading=false;var failed=false;for(var f in _load_file_queue.status){if(_load_file_queue.status[f]==-1){failed=true;}
else if(_load_file_queue.status[f]==0){loading=true;;}}
return{loading:loading,failed:failed};}
function _load_file(type,attributes,success,error){try{var file=document.createElement(type);for(var i in attributes){file.setAttribute(i,attributes[i]);}
if(success&&typeof(success)=='function'){file.onload=success;}
if(error&&typeof(error)=='function'){file.onerror=error;}
document.querySelector('head').appendChild(file);}
catch(e){};}
var _get_user_media=undefined,_connect_stream_to_src=function(){};if(navigator.getUserMedia){_get_user_media=navigator.getUserMedia.bind(navigator);_connect_stream_to_src=function(media_stream,media_element){media_element.srcObject=media_stream;media_element.play();};}
else if(navigator.mozGetUserMedia){_get_user_media=navigator.mozGetUserMedia.bind(navigator);_connect_stream_to_src=function(media_stream,media_element){media_element.mozSrcObject=media_stream;media_element.play();};}
else if(navigator.webkitGetUserMedia){_get_user_media=navigator.webkitGetUserMedia.bind(navigator);_connect_stream_to_src=function(media_stream,media_element){media_element.src=webkitURL.createObjectURL(media_stream);media_element.play();};}
function _clean_object(object,list_of_keys){var keys={};for(var key in list_of_keys){keys[list_of_keys[key]]=1;}
for(var key in object){if(!keys[key]){delete object[key];}}
return object;}
var util={require:_require,get_user_media:_get_user_media,connect_stream_to_src:_connect_stream_to_src,clean_object:_clean_object,};window.awe=new awe();this_awe=window.awe;this_awe.util=util;this_awe.AUTO_DETECT_DEVICE_TYPE=true;}})(window);