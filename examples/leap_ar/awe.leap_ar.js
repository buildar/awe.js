(function(awe) {
  var controller;
  awe.plugins.add([{
    id: 'leap',
    auto_register: true,
    register: function(){
      awe.events.add([{
        id: 'leap_tracking',
        device_types: {
          pc: 1,
        },
        register: function(handler) {
          controller = Leap.loop({enableGestures:true}, function(frame){
            handler(undefined, frame);
          }); 
          controller.on('gesture', function(gesture, frame) {
            if (gesture.type.match(/tap/i)) {
              console.log(gesture.type + " with ID " + gesture.id + " in frame " + frame.id);
              handler(gesture, frame);
            }
          });
          controller.on('connect', function() {
            console.log("Connect event");
          });
          controller.on('deviceConnected', function() {
            console.log("Device Connect event");
          });
          controller.on('deviceDisconnected', function() {
            console.log("Device Disconnect event");
          });
          controller.connect();
        },
        unregister: function(handler){
          controller.disconnect();
          controller = undefined;
        },
        handler: function(gesture, frame) {
          var event = new CustomEvent('leap_tracking', { detail: { gesture:gesture, frame:frame } });
          window.dispatchEvent(event);  
        }
      }]);
    },
    unregister: function(){
      awe.events.delete('leap_tracking');
    }
  }]);
})(window.awe);
