(function(awe) {
  var threshold = 98;
  var width = 640;
  var height = 480;
  var video = document.createElement('video');
  var last_time = 0;
  var tracking_enabled = false, background_video, canvas, ctx, video_stream, detector, raster, param, resultMat, tmp = new Float32Array(16), pov_projection_matrix, pov_projection_matrix2;
  
  function resize_video() { // jsartoolkit specific resize function
    if (awe.device_type() == 'android' && navigator.userAgent.match(/firefox/i)) {
      // NOTE: This is borken - not quite sure what firefox is doing here 8/
      var aspect_ratio = window.innerWidth / window.innerHeight,
        h, w;
      if (window.innerHeight > window.innerWidth) {
        w = window.innerWidth;
        h = window.innerHeight / aspect_ratio;
      }
      else {
        h = window.innerHeight;
        w = window.innerWidth / aspect_ratio;
      }
      if (background_video) {
        background_video.setAttribute('height', h);
        background_video.setAttribute('width', w);
        background_video.style.left = '0px';
      }
      awe.renderer().setSize(w, h);
      awe.renderer().domElement.style.left = '0px';
      awe.pov().aspect = aspect_ratio;
    }
    else {  
      var aspect_ratio = width / height,
        h, w;
      if (window.innerHeight > window.innerWidth) {
        h = window.innerHeight;
        w = h * aspect_ratio;
      }
      else {
        w = window.innerWidth;
        h = w / aspect_ratio;
      }
      if (background_video) {
        background_video.setAttribute('height', h);
        background_video.setAttribute('width', w);
        background_video.style.marginLeft = -w/2 + 'px';
        background_video.style.left = '50%';
      }
      awe.renderer().setSize(w, h);
      awe.renderer().domElement.style.left = '50%';
      awe.renderer().domElement.style.marginLeft = -w/2 + 'px';
      awe.pov().aspect = aspect_ratio;
    }
    awe.pov().updateProjectionMatrix();
    if (pov_projection_matrix2) {
      awe.pov().projectionMatrix.fromArray(pov_projection_matrix2);
    }
    awe.scene_needs_rendering = 1;
  }
  
  THREE.Matrix4.prototype.setFromArray = function(m){
    return this.set(
      m[0],m[4],m[8],m[12],
      m[1],m[5],m[9],m[13],
      m[2],m[6],m[10],m[14],
      m[3],m[7],m[11],m[15]
    );
  };

  function copy_matrix(src, dst){
    dst[0] = src.m00;
    dst[1] = -src.m10;
    dst[2] = src.m20;
    dst[3] = 0;
    dst[4] = src.m02;
    dst[5] = -src.m12;
    dst[6] = src.m22;
    dst[7] = 0;
    dst[8] = -src.m01;
    dst[9] = src.m11;
    dst[10] = -src.m21;
    dst[11] = 0;
    dst[12] = src.m03;
    dst[13] = -src.m13;
    dst[14] = src.m23;
    dst[15] = 1;
  }
  
  function add_ar_events(){
    awe.events.add([{
      id: 'video_stream',
      device_types: {
        android: 1,
        pc: 1
      },
      register: function(handler) {
        window.addEventListener('gum_ready', handler, false);
      },
      unregister: function(handler){
        window.removeEventListener('gum_ready', handler, false);
      },
      handler: function(e) {
        canvas = document.createElement('canvas');
        canvas.id = "ar_canvas";
        canvas.width = width/2;
        canvas.height = height/2;
        canvas.style.display = "none";
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        raster = new NyARRgbRaster_Canvas2D(canvas);
        param = new FLARParam(width/2,height/2);
        resultMat = new NyARTransMatResult();
        detector = new FLARMultiIdMarkerDetector(param,120);
        detector.setContinueMode(true);
        param.copyCameraMatrix(tmp,10,10000);
        pov_projection_matrix = awe.pov().projectionMatrix.toArray();
        awe.pov().projectionMatrix.setFromArray(tmp);
        pov_projection_matrix2 = awe.pov().projectionMatrix.toArray();
        video_stream = awe.video_stream();
        video = video_stream.video_element;
        video.width = width;
        video.height = height;
        background_video = document.createElement('video');
        background_video.setAttribute('width', window.innerWidth);
        background_video.setAttribute('height', window.innerHeight);
        background_video.setAttribute('autoplay', 'true');
        background_video.style.position = 'absolute';
        background_video.style.left = '0px';
        background_video.style.top = '0px';
        background_video.style.zIndex = '-1';
        container.appendChild(background_video);
        awe.util.connect_stream_to_src(video_stream.stream, background_video);
        background_video.addEventListener('play', function(){
          resize_video();
          tracking_enabled = true;
        }, false);
      }
    },
    {
      id: 'ar_tracking',
      device_types: {
        pc: 1,
        android: 1
      },
      register: function(handler) {
        window.addEventListener('tick', handler, false);
        awe.scene_needs_rendering = 1;
      },
      unregister: function(handler){
        window.removeEventListener('tick', handler, false);
      },
      handler: function(event) {
        if (!tracking_enabled) {
          return;
        }
        var video = video_stream.video_element;
        if (!video) {
          return;
        }
        if (video.ended) { video.play(); }
        if (video.paused) { return; }
        if (window.paused) { return; }
        if (video.currentTime == last_time) { return; }
        last_time = video.currentTime;
        try {
          ctx.drawImage(video, 0, 0, width/2, height/2);
        } catch(e) { /* TODO */ }
        canvas.changed = true;
        var detected_count = detector.detectMarkerLite(raster, threshold);
        var event_data = {};
        for (var i=0; i<detected_count; i++) {
          var id = detector.getIdMarkerData(i);
          var currId = -1;
          if (id.packetLength <= 4) {
            currId = 0;
            for (var j = 0; j < id.packetLength; j++) {
              currId = (currId << 8) | id.getPacketData(j);
            }
          }
          detector.getTransformMatrix(i, resultMat);
          copy_matrix(Object.asCopy(resultMat), tmp);
          event_data[currId] = {
            transform: Object.asCopy(tmp)
          };
        }
        var event = new CustomEvent('ar_tracking_marker', { detail: event_data });
        window.dispatchEvent(event);  
      }
    },
    {
      id: 'resize_screen',
      device_types: {
        pc: 1,
        android: 1
      },
      register: function(handler) {
        window.addEventListener('resize', handler, false);
      },
      unregister: function(handler){
        window.removeEventListener('resize', handler, false);
      },
      handler: function(e) {
        resize_video();
      }
    }]);
  }
  
  function remove_ar_events(){
    awe.events.delete('ar_tracking');
    awe.events.delete('video_stream');
    awe.events.delete('resize_screen');
  }
  
  awe.plugins.add([{
    id: 'jsartoolkit',
    auto_register: true,
    register: function(plugin_data){
      add_ar_events();
      awe.setup_stream();
    },
    unregister: function(plugin_data){
      remove_ar_events();
    }
  }]);
})(window.awe);
