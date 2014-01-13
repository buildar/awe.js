(function(awe) {
	awe.plugins.add([{
		id: 'window_resized',
    auto_register: true,
		register: function(){
			awe.events.add([
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
            aspect_ratio = window.innerWidth / window.innerHeight;
            awe.pov().aspect = aspect_ratio;
            awe.pov().updateProjectionMatrix();
            awe.renderer().setSize(window.innerWidth, window.innerHeight);
            awe.scene_needs_rendering = 1;
					}
				}
			]);
		},
		unregister: function(){
			awe.events.delete('resize');
		}
	}]);
})(window.awe);
