(function(awe) {
	var container = document.getElementById('container');
	var background_video;
	
	function resize_video() {
		if (background_video) {
			var video = awe.video_stream().video_element;
			var w = video.videoWidth,
				h = video.videoHeight;
			var cnt_h = container.clientHeight,
				cnt_w = container.clientWidth,
				wrapper_aspect_ratio = cnt_w / cnt_h,
				video_aspect_ratio = w / h
			
			// stretch the video to cover the background entirely and center it
			if (wrapper_aspect_ratio > video_aspect_ratio) {
				background_video.setAttribute('width', cnt_w);
				background_video.setAttribute('height', cnt_w / video_aspect_ratio);
				background_video.style.marginLeft = (-cnt_w/2)+'px';
			}
			else {
				background_video.setAttribute('height', cnt_h);
				background_video.setAttribute('width', cnt_h * video_aspect_ratio);
				background_video.style.marginLeft = (-cnt_h * video_aspect_ratio / 2)+'px';	
			}
		}
		aspectRatio = window.innerWidth / window.innerHeight;
		awe.pov().aspect = aspectRatio;
		awe.pov().updateProjectionMatrix();
		awe.renderer().setSize(window.innerWidth, window.innerHeight);
		awe.scene_needs_rendering = 1;
	}

	awe.plugins.add([{
		id: 'geo_ar',
		auto_register: true,
		register: function(plugin_data){
			// add video stream
			awe.setup_stream();
			awe.events.add([
				{
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
						var video = awe.video_stream();
						background_video = document.createElement('video');
						background_video.setAttribute('width', window.innerWidth);
						background_video.setAttribute('height', window.innerHeight);
						background_video.setAttribute('autoplay', 'true');
						background_video.style.position = 'absolute';
						background_video.style.left = '50%';
						background_video.style.marginLeft = (-window.innerWidth/2)+'px';
						background_video.style.top = '0px';
						background_video.style.zIndex = '-1';
						container.appendChild(background_video);
						awe.util.connect_stream_to_src(awe.video_stream().stream, background_video);
						background_video.addEventListener('play',resize_video, false);
            setTimeout(function() {
              resize_video();
            }, 1000);
					}
				}
			]);
			
			// toDeg() is a Number object extension courtesy http://www.movable-type.co.uk/scripts/latlong.html 
			if (typeof Number.prototype.toDeg == 'undefined') {
				Number.prototype.toDeg = function() {
					return this * 180 / Math.PI;
				};
			}
			if (typeof Number.prototype.toRad == 'undefined') {
				Number.prototype.toRad = function() {
					return this * Math.PI / 180;
				};
			}
			
			awe.events.add({
				id: 'deviceorientation',
				device_types: {
					pc: 1,
					android: 1
				},
				register: function(handler) {
					window.addEventListener('deviceorientation', handler, false);
				},
				unregister: function(handler){
					window.removeEventListener('deviceorientation', handler, false);
				},
				handler: function(e) {
					var alpha = e.alpha,
					    beta = e.beta,
              gamma = e.gamma,
              x = 0,
              y = 0,
              z = 0;

          if ((beta > 30 && beta < 150) || // device is generally upright (portrait)
              (beta < -30 && beta > -150)) { // device is generally upright but inverted (portrait)
            x = beta+90;
            y = (alpha+gamma)%360;
            z = 180;
          } else { // device is generally not-upright (landscape)
            if (gamma < 0 && gamma > -90) { // rotation below horizon
              x = -gamma-90;
            } else { // rotation above horizon
              x = 90-gamma;
            }
            y = (alpha+gamma+180)%360;
          }

          awe.povs.update({
            data: {
              euler_order: 'YZX',
              rotation: {
                x: x,
                y: y,
                z: z,
              }
            },
            where: {
              id: 'default'
            }
          });
				}
			});
			
			awe.events.add([
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
				}
			]);
		},
		unregister: function(plugin_data){
			awe.events.delete('resize_screen');
			awe.events.delete('deviceorientation');
			awe.events.delete('video_stream');
		}
	}]);
})(window.awe);
