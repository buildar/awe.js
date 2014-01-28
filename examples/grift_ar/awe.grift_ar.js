(function(awe) {
	var oculus_bridge,
		super_render,
		rift_enabled = false,
		bodyAngle = 0,
		riftCam;
		
	function on_resize() {
	  if(!rift_enabled || !riftCam){
	    windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
	    aspectRatio = window.innerWidth / window.innerHeight;
	    awe.pov().aspect = aspectRatio;
	    awe.pov().updateProjectionMatrix();
	    awe.renderer().setSize(window.innerWidth, window.innerHeight);
	  } else {
	    riftCam.setSize(window.innerWidth, window.innerHeight);
	  }
	  awe.scene_needs_rendering = 1;
	}
	
	function connect() {
		oculus_bridge.connect();
	}
	function disconnect() {
		oculus_bridge.disconnect();
	}
	function show_connection_state(state) {
		var btn = document.querySelector('._rift_toggle')
		btn.setAttribute('class', '_rift_toggle '+state)
		btn.setAttribute('title', state)
	}
	
	// add the rift plugin
	awe.plugins.add([{
		id: 'rift_display',
		register: function(plugin_data){
			// add video stream background
			awe.setup_stream();
			awe.events.add([
				{
					id: 'video_stream',
					device_types: {
						pc: 1
					},
					register: function(handler) {
						window.addEventListener('gum_ready', handler, false);
					},
					unregister: function(handler){
						window.removeEventListener('gum_ready', handler, false);
					},
					handler: function(e) {
						awe.projections.add({
							id: 'camera1',
							position: {
								x: 0,
								y: 0,
								z: -400
							},
							geometry: {
								shape: 'plane',
								width: 1200,
								height: 900
							},
							texture: {	
		          	color: 0xFFFFFF,
								path: 'camerastream'
							}
						}, {
							parent: {
								object_type: 'pov',
								object_id: 'default'
							}
						});
					}
				}
			]);
			
			awe.events.add([{
				id: 'rift_toggle',
				device_types: {
					pc: 1
				},
				register: function(handler) {
					document.querySelector('._rift_toggle').addEventListener('click', handler, false);
				},
				unregister: function(handler){
					document.querySelector('._rift_toggle').removeEventListener('click', handler, false);
				},
				handler: function(e) {
					e.preventDefault();
					rift_enabled = !rift_enabled;
					on_resize();
					if (rift_enabled) {
						connect();
						show_connection_state('connecting');
					}
					else {
						disconnect();
						show_connection_state('disconnected');
					}
				}
			},
			{
				id: 'resize',
				device_types: {
					pc: 1
				},
				register: function(handler) {
					window.addEventListener('resize', handler, false);
				},
				unregister: function(handler){
					window.removeEventListener('resize', handler, false);
				},
				handler: function(e) {
					on_resize();
				}
			},
			{
				id: 'setup_bridge',
				device_types: {
					pc: 1
				},
				register: function(handler) {
					oculus_bridge = new OculusBridge({
				    onOrientationUpdate: handler,
				    onConnect: function(){
							show_connection_state('connected');
				    },
						onDisconnect: function(){
				    	show_connection_state('disconnected');
							rift_enabled = false;
							on_resize();
						}
					});
					riftCam = new THREE.OculusRiftEffect(awe.renderer());
				},
				unregister: function(){
					oculus_bridge.disconnect();
					delete(oculus_bridge);
					delete(riftCam);
					rift_enabled = false;
					on_resize();
				},
				handler: function(quatValues) {
				  var bodyAxis = new THREE.Vector3(0, 1, 0);
			    // make a quaternion for the the body angle rotated about the Y axis
			    var bodyQuat = new THREE.Quaternion();
			    bodyQuat.setFromAxisAngle(bodyAxis, bodyAngle);
			    // make a quaternion for the current orientation of the Rift
			    var riftQuat = new THREE.Quaternion(quatValues.x, quatValues.y, quatValues.z, quatValues.w);
			    // multiply the body rotation by the Rift rotation.
			    bodyQuat.multiply(riftQuat);
			    // Make a vector pointing along the Z axis and rotate it 
			    // according to the combined look+body angle.
			    var xzVector = new THREE.Vector3(0, 0, 1);
			    xzVector.applyQuaternion(bodyQuat);
			    // Compute the X/Z angle based on the combined look/body angle.
			    viewAngle = Math.atan2(xzVector.z, xzVector.x) + Math.PI;
			    // Update the camera so it matches the current view orientation
			    window.awe.povs.view('default').quaternion.copy(bodyQuat);
				}
			},
			{
				id: 'tick',
				device_types: {
					pc: 1,
				},
				register: function(handler) {
					window.addEventListener('tick', handler, false);
				},
				unregister: function(handler){
					window.removeEventListener('tick', handler, false);
				},
				handler: function(event) {
					if (rift_enabled && riftCam) {
			    	riftCam.render(awe.scene(), awe.pov());
			    }
			    else {
				    super_render();
			    }
				}
			}]);
			// overwrite the default renderer
			super_render = awe.render;
			document.getElementById('toggle').on('click', function(){
        // TODO
			})
		},
		unregister: function(plugin_data){
			// restore default awe.render
			awe.render = super_render;
			awe.events.delete('rift_toggle');
			awe.events.delete('resize');
			awe.events.delete('bridge_update');
			awe.events.delete('tick');
			awe.render = super_render;
		}
	}]);
})(window.awe);
