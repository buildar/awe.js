(function(awe) {
  var mouse = {};
  var projector = new THREE.Projector();
  var ray = new THREE.Raycaster();
	awe.plugins.add([{
		id: 'object_clicked',
    auto_register: true,
		register: function(){
			awe.events.add([
				{
					id: 'click',
					register: function(handler) {
						window.addEventListener('click', handler, false);
					},
					unregister: function(handler){
						window.removeEventListener('click', handler, false);
					},
					handler: function(e) {
            var click_handling = awe.settings.view("click_handling");
            if (click_handling === undefined || click_handling == true) {
              var camera = awe.pov();
              mouse.x = (e.clientX/window.innerWidth) * 2 - 1;
              mouse.y = -(e.clientY/window.innerHeight) * 2 + 1;
              var mouse_vector = new THREE.Vector3(mouse.x, mouse.y, 1);
              projector.unprojectVector(mouse_vector, camera); 
              var direction = mouse_vector.sub(camera.position).normalize();
              ray.set(camera.position, direction);
              var intersects = ray.intersectObjects(awe.projections.list({ type:'clickable' }), true);
              if (intersects.length) {
                var mesh = _get_clicked_projection(intersects[0].object);
                if (mesh && mesh.projection_id) {
                  intersects[0].projection_id = mesh.projection_id;
                  var event = new CustomEvent('object_clicked', { detail:intersects[0] });
                  window.dispatchEvent(event);
                }
              }
            }
					}
				}
			]);
		},
		unregister: function(){
			awe.events.delete('click');
		}
	}]);
  function _get_clicked_projection(mesh) {
    if (mesh.projection_id == undefined) {
      if (mesh.parent == undefined) {
        return undefined;
      } else {
        return _get_clicked_projection(mesh.parent);
      }
    } else {
      return mesh;
    }
  }
})(window.awe);
