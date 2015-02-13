/*

	The MIT License

	Copyright (c) 2013 Rob Manson & Malgorzata Wierzbicka, http://buildAR.com. 
	All rights reserved.

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

*/

(function(window) {
  var this_awe;
  var _clickable_objects = [];
	if (window.awe) {
    this_awe = window.awe;
    
    this_awe.constructor.prototype.renderers = new awe_v8();
    this_awe.constructor.prototype.renderers.add = function(BODY, HEAD) {
      if (!BODY) { BODY = {}; }
      if (!HEAD) { HEAD = {}; }
      if (this_awe.settings.view('renderer')) {
        if (this_awe.capabilities.view("webgl") && this_awe.settings.view('renderer') == 'webgl') {
          var antialias = this_awe.settings.view('antialias') || true;
          var renderer = new THREE.WebGLRenderer({ antialias: antialias });
          var shadows = this_awe.settings.view('shadows') || false;
          // spotlight is required to add shadows!
          // see https://github.com/mrdoob/three.js/issues/748
          if (shadows) {
            renderer.shadowMapEnabled = shadows; 
            var shadow_map_type = this_awe.settings.view('shadow_map_type') || "pcf_soft";
            if (shadow_map_type == "basic") {
              renderer.shadowMapType = THREE.BasicShadowMap;
            } else if (shadow_map_type == "pcf") {
              renderer.shadowMapType = THREE.PCFShadowMap;
            } else if (shadow_map_type == "pcf_soft") {
              renderer.shadowMapType = THREE.PCFSoftShadowMap;
            } else {
              throw { code: 500, message: 'shadow_map_type unsupported' };
            }
          }
        }
        else if (this_awe.settings.view('renderer') == 'css3d' || !this_awe.capabilities.view("webgl")) {
          if (this_awe.capabilities.view({ id: 'css3d' })) {
            var renderer = new THREE.CSS3DRenderer();
          }
          else {
            throw { code: 500, message: 'three.js css3d renderer creation failed' };
          }
        }
        if (!renderer) {
          throw { code: 500, message: 'three.js renderer creation failed' };
        }
        else {
          var l = this.constructor.prototype.list().length;
          renderer.setSize(window.outerWidth, window.outerHeight);
          var awe_canvas = renderer.domElement;
          awe_canvas.id = 'awe_canvas-'+l;
          if (this_awe.settings.view('canvas_style')) {
            try {
              for (var i in this_awe.settings.view('canvas_style')) {
                awe_canvas.style[i] = this_awe.settings.view('canvas_style')[i];
              }
            }
            catch(e) { /* TODO */ };
          }
          else {						 
            awe_canvas.style.position = 'absolute';
            awe_canvas.style.top = '0px';
            awe_canvas.style.left = '0px';
            awe_canvas.style.width = '100%';
            awe_canvas.style.height = '100%';
          }
          if (BODY.container_id && document.getElementById(BODY.container_id)) {
            document.getElementById(BODY.container_id).appendChild(awe_canvas);
          }
          else if (this_awe.settings.view('container_id') && document.getElementById(this_awe.settings.view('container_id'))) {
            document.getElementById(this_awe.settings.view('container_id')).appendChild(awe_canvas);
          }
          else {
            document.body.appendChild(awe_canvas);
          }
        }
      }
      else {
        throw { code: 500, message: 'three.js renderer not defined' };
      }
      BODY.value = renderer;
      this_awe.scene_needs_rendering = 1;
      return this.constructor.prototype.add.call(this, BODY, HEAD); // super
    }

    this_awe.constructor.prototype.renderer = function() {
      return this_awe.renderers.view({ id: 'default' });
    }; 

    this_awe.constructor.prototype.lights = new awe_v8();
    this_awe.constructor.prototype.lights.add = function(BODY, HEAD) {
      if (!BODY) { BODY = {}; }
      if (!HEAD) { HEAD = {}; }
      var id = BODY.id || "light-"+new Date().getTime()+'-'+Math.round(Math.random()*1000);
      delete BODY.id;
      if (!BODY.color) {
        BODY.color = 0x404040;
      }
      var light = new THREE.AmbientLight(BODY.color);
      if (BODY.intensity) {
        light.intensity = BODY.intensity;
      }
      switch (BODY.type) {
        case 'area':
          light = new THREE.AreaLight(BODY.color);
          break;
        case 'directional':
          light = new THREE.DirectionalLight(BODY.color);
          break;
        case 'hemisphere':
          light = new THREE.HemisphereLight(BODY.color);
          if (BODY.ground_color) {
            light.groundColor = BODY.ground_color;
          }
          break;
        case 'point':
          light = new THREE.PointLight(BODY.color);
          if (BODY.distance) {
            light.distance = BODY.distance;
          }
          break;
        case 'spot':
          light = new THREE.SpotLight(BODY.color);
          break;
      }
      
      if (light.position && BODY.position && typeof(BODY.position) == 'object') {
        for (var p in BODY.position) {
          light.position[p] = BODY.position[p];
        }
      }
      if (light.target && light.target.position && BODY.target && typeof(BODY.target) == 'object') {
        for (var p in BODY.target) {
          light.target.position[p] = BODY.target[p];
        }
      }
      if (BODY.cast_shadow) {
        light.castShadow = BODY.cast_shadow;
      }
      this_awe.scene().add(light);
      this_awe.scene_needs_rendering = 1;
      return this.constructor.prototype.add.call(this, { id: id, value: light }); // super
    }
    
    this_awe.constructor.prototype.video_streams = new awe_v8();
    this_awe.constructor.prototype.video_streams.add = function(BODY, HEAD) {
      if (this_awe.capabilities.view('gum')) {
        if (!BODY) { BODY = {}; }
        if (!HEAD) { HEAD = {}; }
        try {
          var self = this,
            video_id = 'video_stream-'+(new Date()).getTime(),
            width = 640,	// TODO should be based on viewport width
            height = 480, // TODO should be based on viewport height
            video = document.createElement('video');
          
          video.setAttribute('id', video_id);
          video.setAttribute('autoplay', true);

          BODY.video_element = video;
          var result = this.constructor.prototype.add.call(this, BODY, HEAD); // super
          
          // if many sources try to get the environemt-facing camera
          var go = function(video_source_id){
            var options = {
              video: true
            };
            if (video_source_id) {
              options.video = {
                optional: [{ facingMode: "environment" }, {sourceId: video_source_id}]
              };
            }
            this_awe.util.get_user_media(options, 
              function(stream) {
                video.setAttribute('width', '100%');	
                video.setAttribute('height', '100%');
                document.body.appendChild(video);
                video.style.position = 'absolute';
                video.style.top = '-999em';
                video.style.left = '-999em';
                video.style.height = '100%';
                video.style.width = '100%';
                
                BODY.stream = stream;
                self.constructor.prototype.update.call(this, {data: {stream: stream}, where: {id: BODY.id}}, HEAD); // super
                this_awe.util.connect_stream_to_src(stream, video);
                
                var event = new CustomEvent('gum_ready');
                window.dispatchEvent(event);
              }, 
              function(e) {
                var event = new CustomEvent('gum_error');
                window.dispatchEvent(event);
              }
            );
          }
          
          if (window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
            MediaStreamTrack.getSources(function(source_infos) {
              var selected_source = null;
              for (var i = 0; i != source_infos.length; ++i) {
                var source_info = source_infos[i];
                if (source_info.kind === 'video') {
                  if (!selected_source || (source_info.facing && source_info.facing == "environment")) {
                    selected_source = source_info.id;
                  }
                }
              }
              go(selected_source);
            });
          }
          else {
            go();
          }
        }
        catch(e) {
          console.log(e);
        }
        return result;
      }
      else {
        throw { code: 500, message: 'video streams not supported by this browser' };
      }
    }
    this_awe.constructor.prototype.video_streams.delete = function(BODY, HEAD) {
      if (this_awe.capabilities.view('gum')) {
        if (!BODY) { BODY = {}; }
        if (!HEAD) { HEAD = {}; }
        try {
          if (typeof BODY == 'string' || typeof BODY == 'number') {
            video_stream = this.constructor.prototype.view(BODY);
            BODY = { id: BODY };
          }
          else if (BODY.id) {
            video_stream = this.constructor.prototype.view(BODY.id);
          }
          if (video_stream && video_stream.stream) {
            video_stream.stream.stop()
          }
          return this.constructor.prototype.delete.call(this, BODY, HEAD); // super
        }
        catch(e) {
          console.log(e);
        }
      }
    };

    this_awe.constructor.prototype.video_stream = function() {
      return this_awe.video_streams.view({ id: 'default' });
    }; 
    
    this_awe.constructor.prototype.scenes = new awe_v8();
    this_awe.constructor.prototype.scenes.add = function(BODY, HEAD) {
      if (!BODY) { BODY = {}; }
      if (!HEAD) { HEAD = {}; }
      var scene = new THREE.Scene();
      BODY.value = scene;
      this_awe.scene_needs_rendering = 1;
      return this.constructor.prototype.add.call(this, BODY, HEAD); // super
    }

    this_awe.constructor.prototype.scene = function() {
      return this_awe.scenes.view({ id: 'default' });
    };
    this_awe.constructor.prototype.scene.stringify = function() {
      // TODO walk the scene and stringify to JSON
    }
    
    this_awe.constructor.prototype.povs = new awe_v8();
    this_awe.constructor.prototype.povs.add = function(BODY, HEAD) {
      if (!BODY) { BODY = {}; }
      if (!HEAD) { HEAD = {}; }
      var fov = this_awe.settings.view('fov') || 65;	// ~fov of ios devices - TODO: should set default based on device_type or ideally camera introspection
      var near = this_awe.settings.view('near') || 1;
      var far = this_awe.settings.view('far') || 10000;
      var renderer = this_awe.renderer();
      var aspect_ratio = renderer.domElement.clientWidth / renderer.domElement.clientHeight; 
      if (BODY.renderer_id) {
        renderer = awe.renderers.view(BODY.renderer_id) || this_awe.renderer();
        if (renderer) {
          aspect_ratio = renderer.domElement.clientWidth / renderer.domElement.clientHeight;
        }
      }
      delete(BODY.renderer_id);
      
      var pov = new THREE.PerspectiveCamera(
        fov,
        aspect_ratio,
        near,
        far
      );
      if (!this_awe.settings.view('default_camera_position')) {
        this_awe.settings.add({
          id: 'default_camera_position',
          value: { x:0, y:0, z:0 },
        });
      }
      var position = _extend({x:0, y:0, z:0}, this_awe.settings.view('default_camera_position'));
      pov.position.set(position.x, position.y, position.z);
      pov.lookAt(this_awe.origin);

      pov.constructor.prototype.look_at_projection = function(projection_name) {
        var projection = this_awe.projections.view(projection_name);
        var origin_position = projection.mesh.parent.position;
        var projection_position = projection.mesh.position;
        var position = {};
        for (var p in origin_position) {
          position[p] = origin_position[p]+projection_position[p];
        }
        this.lookAt(position);
        _map_audio_listener_to_pov();
        this_awe.scene_needs_rendering = 1;
      };

      pov.constructor.prototype.look_at_poi = function(poi) {
        this.lookAt(this_awe.pois.view(poi).origin.mesh.position);
        _map_audio_listener_to_pov();
        this_awe.scene_needs_rendering = 1;
      };

      pov.constructor.prototype.look_at = function(position) {
        this.lookAt(new THREE.Vector3(position.x, position.y, position.z));
        _map_audio_listener_to_pov();
        this_awe.scene_needs_rendering = 1;
      };

      BODY.value = pov;
      this_awe.scene().add(pov);
      this_awe.scene_needs_rendering = 1;

      return this.constructor.prototype.add.call(this, BODY, HEAD); // super
    }

    this_awe.constructor.prototype.povs.update = function(BODY, HEAD) {
      if (!BODY) { BODY = {}; }
      if (!HEAD) { HEAD = {}; }
      if (BODY.data && BODY.where && BODY.where.id) {
        var fields_updated = [];
        if (BODY.data.position) { 
          fields_updated.push('position');
          var position = this_awe.pov().position;
          for (var p in BODY.data.position) {
            position[p] = BODY.data.position[p];
          }
          if (this_awe.capabilities.view("audio")) {
            this_awe.util.audio_context.listener.setPosition(position.x, position.y, position.z);
          }
        } 
        if (BODY.data.scale) { fields_updated.push('scale'); } 
        if (BODY.data.rotation) { 
          fields_updated.push('rotation'); 
          _map_audio_listener_to_pov();
        } 
        if (fields_updated.length) {
          HEAD.fields_updated = fields_updated;
        }
        if(BODY.data.animation && parseFloat(BODY.data.animation.duration) > 0) {
        	_tween(_extend({
            mesh: this_awe.projections.view(BODY.where.id).mesh, // TODO this is a bug so need to refactor tweening to support pov().position
            end_state: BODY.data
          }, BODY.data.animation));
        }
        else {
          _update_mesh_io(BODY.data, this_awe.pov());
      }
        this_awe.scene_needs_rendering = 1;
      }
      return this.constructor.prototype.update.call(this, BODY, HEAD); // super
    };

    this_awe.constructor.prototype.pov = function() {
      return this_awe.povs.view({ id: 'default' });
    };

    this_awe.constructor.prototype.pois = new awe_v8();
    this_awe.constructor.prototype.pois.add = function(BODY, HEAD) {
      if (!BODY) { BODY = {}; }
      if (!HEAD) { HEAD = {}; }
      var id = new Date().getTime()+'-'+Math.round(Math.random()*1000);
      if (!BODY.id) {
        BODY.id = 'poi-'+id;
      }
      var projections = [];
      if (BODY.projections && Array.isArray(BODY.projections)) {
        projections = BODY.projections;
        delete BODY.projections;
      }
      var origin_id = 'projection-'+id+'-origin';
      var projection_io = {};
      var result = this.constructor.prototype.add.call(this, BODY, HEAD); // super
      var poi = this_awe.pois.view(BODY.id);
      this_awe.projections.add({ 
        id: origin_id,
        position: BODY.position || { x: 0, y: 0, z: 0 },
        scale: BODY.scale || { x: 1, y: 1, z: 1 },
        rotation: { x: 0, y: 0, z: 0 },
        geometry: { shape: 'sphere', radius: 0.1 },
      }, { poi_id: BODY.id, is_origin: true });
      poi.origin = this_awe.projections.view(origin_id);
      if (!poi.projections) {
        poi.projections = [];
      }
      for (var projection in projections) {
        projection_io = projections[projection];
        if (!projection_io.id) {
          projection_io.id = 'projection-'+id;
        }
        this_awe.projections.add(projection_io, { poi_id: BODY.id });
      }
      return result;
    };
    this_awe.constructor.prototype.pois.update = function(BODY, HEAD) {
      if (!BODY) { BODY = {}; }
      if (!HEAD) { HEAD = {}; }
      if (BODY.data && BODY.where && BODY.where.id) {
        var fields_updated = [];
        if (BODY.data.position) { fields_updated.push('position'); } 
        if (BODY.data.scale) { fields_updated.push('scale'); } 
        if (BODY.data.rotation) { fields_updated.push('rotation'); } 
        if (fields_updated.length) {
          HEAD.fields_updated = fields_updated;
        }
        if(BODY.data.animation && parseFloat(BODY.data.animation.duration) > 0) {
        	_tween(_extend({
            mesh: this_awe.pois.view(BODY.where.id).origin.mesh,
            end_state: BODY.data
          }, BODY.data.animation));
        }
        else {
          _update_mesh_io(BODY.data, this_awe.pois.view(BODY.where.id).origin.mesh);
          this_awe.scene_needs_rendering = 1;
        }
      }
      return this.constructor.prototype.update.call(this, BODY, HEAD); // super
    };
    this_awe.constructor.prototype.pois.delete = function(BODY, HEAD) {
      if (!BODY) { BODY = {}; }
      if (!HEAD) { HEAD = {}; }
      var projection;
      if (typeof BODY == 'string' || typeof BODY == 'number') {
        poi = this_awe.pois.view(BODY);
        BODY = { id: BODY };
      }
      else if (BODY.id) {
        poi = this_awe.pois.view(BODY.id);
      }
      if (poi.origin.mesh) {
        this_awe.scene().remove(poi.origin.mesh);
      }
      if (poi.projections) {
        for (var i in poi.projections) {
          this_awe.projections.delete(poi.projections[i]);
        }
      }
      this_awe.scene_needs_rendering = 1;
      return this.constructor.prototype.delete.call(this, BODY, HEAD); // super
    };

    this_awe.constructor.prototype.projections = new awe_v8();
    this_awe.constructor.prototype.projections.list = function(BODY, HEAD) {
      if (!BODY) { BODY = {}; }
      if (!HEAD) { HEAD = {}; }
      if (BODY.type && BODY.type === "clickable") {
        return _clickable_objects;
      } else {
        return this.constructor.prototype.list.call(this, BODY, HEAD); // super
      }
    }
    this_awe.constructor.prototype.projections.add = function(BODY, HEAD) {
      if (!BODY) { BODY = {}; }
      if (!HEAD) { HEAD = {}; }
      var geometry, material, mesh, parent;
      if (!BODY.id) {
         throw 'BODY.id required';
       }
      if (this_awe.projections.view(BODY.id)) {
        throw 'BODY.id already exists';
      }
      if (HEAD.parent && HEAD.parent.object_id && HEAD.parent.object_type && this_awe[HEAD.parent.object_type+'s'] && ''+this_awe[HEAD.parent.object_type+'s'] == 'awe_v8_object')  {
				try {
		      parent = this_awe[HEAD.parent.object_type+'s'].view(HEAD.parent.object_id);
	      }
	      catch(e) {}
      }
      else if (HEAD.poi_id) {
	      parent = this_awe.pois.view(HEAD.poi_id);
      }
      if (!parent) {
        throw 'HEAD.poi_id or HEAD.parent required';
      }
      if (!BODY.material) {
        BODY.material = {};
      }
      if (!BODY.texture) {
        BODY.texture = {};
      }
      if (BODY.sound) {
        if (this_awe.capabilities.view("audio")) {
          if (BODY.sound.path == undefined) {
            throw "sound path required";
          }
          BODY.sound.source = this_awe.util.audio_context.createBufferSource();
          BODY.sound.panner = this_awe.util.audio_context.createPanner();
          BODY.sound.source.connect(BODY.sound.panner);
          BODY.sound.panner.connect(this_awe.util.audio_context.destination);
          BODY.sound.panner.refDistance = 100;
          var position = { x:0, y:0, z:0 };
          if (BODY.position !== undefined) {
            for (var p in BODY.position) {
              position[p] = BODY.position[p];
            }
          }
          BODY.sound.panner.setPosition(position.x, position.y, position.z);
          this_awe.sounds.add(BODY.sound);
        }
      }
      if (BODY.geometry) {
        if (BODY.geometry.shape) {
          var shape = _validate_shape(BODY.geometry);
          switch(BODY.geometry.shape) {
            case 'cube': 
              geometry = new THREE.CubeGeometry(shape.x, shape.y, shape.z);
              break;
            case 'sphere': 
              geometry = new THREE.SphereGeometry(shape.radius, shape.widthSegments, shape.heightSegments, shape.phiStart, shape.phiLength, shape.thetaStart, shape.thetaLength);
              break;
            case 'cylinder': 
              geometry = new THREE.CylinderGeometry(shape.radiusTop, shape.radiusBottom, shape.height, shape.radiusSegments, shape.heightSegments, shape.openEnded);
              break;
            case 'lathe': 
              geometry = new THREE.LatheGeometry(shape.points, shape.segments, shape.phiStart, shape.phiLength);
              break;
            case 'octahedron': 
              geometry = new THREE.OctahedronGeometry(shape.radius, shape.detail);
              break;
            case 'plane': 
              geometry = new THREE.PlaneGeometry(shape.width, shape.height, shape.widthSegments, shape.heightSegments)
              break;
            case 'tetrahedron': 
              geometry = new THREE.TetrahedronGeometry(shape.radius, shape.detail);
              break;
            case 'text': 
              geometry = new THREE.TextGeometry(shape.text, shape.parameters)
              break;
            case 'torus': 
              geometry = new THREE.TorusGeometry(shape.radius, shape.tube, shape.radialSegments, shape.tubularSegments, shape.arc);
              break;
            case 'torusknot': 
              geometry = new THREE.TorusKnotGeometry(shape.radius, shape.tube, shape.radialSegments, shape.tubularSegments, shape.p, shape.q, shape.heightScale);
              break;
            case 'tube': 
              geometry = new THREE.TubeGeometry(shape.path, shape.segments, shape.radius, shape.radiusSegments, shape.closed, shape.debug)
              break;
            default: 
              geometry = new THREE.CubeGeometry(10,10,10);
          }
          if (geometry) {
            var texture, material;
            if (BODY.texture.path) {
              if (BODY.geometry.x) { 
                BODY.texture.width = BODY.geometry.x; 
              }
              if (BODY.geometry.y) { 
                BODY.texture.height = BODY.geometry.y; 
              }
              var texture_id = this_awe.textures.add(BODY.texture);
							if (BODY.texture.color) {
								BODY.material.color = BODY.texture.color;
							}
              BODY.material.map = this_awe.textures.view(texture_id);
            }
            var material_id = this_awe.materials.add(BODY.material);
            var material = this_awe.materials.view(material_id);
            mesh = new THREE.Mesh(geometry, material);
            this_awe.scene_needs_rendering = 1;
          }
        }
        else if (BODY.geometry.path) {
          var loader;
          if (BODY.material.path) {
            loader = new THREE.OBJMTLLoader();
            loader.load(BODY.geometry.path, BODY.material.path, function(mesh) {
              BODY.mesh = _update_mesh_io(BODY, mesh, true);
              if (parent.origin) {
	            	parent.origin.mesh.add(BODY.mesh); 
              }
              else {
	              parent.add(BODY.mesh); 
              }
              var _clickable_id = _clickable_objects.length;
              BODY.mesh.projection_id = BODY.id; 
              _clickable_objects.push(BODY.mesh);
              this_awe.projections.update({ data:{ _clickable_object_id:_clickable_id }, where:{ id:BODY.id } });
              this_awe.scene_needs_rendering = 1;
              this_awe.scene_needs_rendering = 1;
              var event = new CustomEvent('projection_loaded', { detail: BODY.id });
              window.dispatchEvent(event);
            });
          }
          else {
            loader = new THREE.OBJLoader();
            var texture;
            if (BODY.texture.path) {
              if (BODY.geometry.x) { 
                BODY.texture.width = BODY.geometry.x; 
              }
              if (BODY.geometry.y) {
                BODY.texture.height = BODY.geometry.y; 
              }
              var texture_id = this_awe.textures.add(BODY.texture);
              texture = this_awe.textures.view(texture_id);
            }
            else {
              var texture_id = this_awe.textures.add();
              texture = this_awe.textures.view(texture_id);
            }
            loader.load(BODY.geometry.path, function (mesh) {
              mesh.traverse(function (child) {
                if ( child instanceof THREE.Mesh ) {
                  child.material.map = texture;
                }
              });
              BODY.mesh = _update_mesh_io(BODY, mesh, true);
              if (parent.origin) {
	            	parent.origin.mesh.add(BODY.mesh); 
              }
              else {
	              parent.add(BODY.mesh); 
              }
              
              var _clickable_id = _clickable_objects.length;
              BODY.mesh.projection_id = BODY.id; 
              _clickable_objects.push(BODY.mesh);
              this_awe.projections.update({ data:{ _clickable_object_id:_clickable_id }, where:{ id:BODY.id } });
              this_awe.scene_needs_rendering = 1;
              var event = new CustomEvent('projection_loaded', { detail: BODY.id });
              window.dispatchEvent(event);
            });
          }
          return this.constructor.prototype.add.call(this, BODY, HEAD); // super
        }
        else {
          geometry = new THREE.CubeGeometry(10,10,10);
          var material_id = this_awe.materials.add(BODY.material);
          var material = this_awe.materials.view(material_id);
          mesh = new THREE.Mesh(geometry, material);
          this_awe.scene_needs_rendering = 1;
        }
      }
      BODY.mesh = _update_mesh_io(BODY, mesh, true);
      if (BODY.scale) {
        for (var p in BODY.scale) {
          BODY.mesh.scale[p] = BODY.scale[p];
        }
      }
      var result = this.constructor.prototype.add.call(this, BODY, HEAD); // super
      var projection = this_awe.projections.view(BODY.id);
      if (HEAD.is_origin) {
        this_awe.scene().add(BODY.mesh);
      }
      else {
        var _clickable_id = _clickable_objects.length;
        BODY.mesh.projection_id = result.id; 
        _clickable_objects.push(BODY.mesh);
        this_awe.projections.update({ data:{ _clickable_object_id:_clickable_id }, where:{ id:result.id } });
        
        if (parent.origin) {
        	parent.origin.mesh.add(BODY.mesh); 
        }
        else {
          parent.add(BODY.mesh); 
        }
      }
      if (!parent.projections) {
        parent.projections = [];
      }
      parent.projections.push(projection.id);
      var event = new CustomEvent('projection_loaded', {detail: BODY.id});
      window.dispatchEvent(event);
      return result;
    };
    this_awe.constructor.prototype.projections.view = function(BODY, HEAD) {
      if (!BODY) { BODY = {}; }
      if (!HEAD) { HEAD = {}; }
      var projection = this.constructor.prototype.view.call(this, BODY, HEAD); // super
      if (projection) {
        projection.position = {
          x: projection.mesh.position.x,
          y: projection.mesh.position.y,
          z: projection.mesh.position.z,
        }; 
        projection.scale = {
          x: projection.mesh.scale.x,
          y: projection.mesh.scale.y,
          z: projection.mesh.scale.z,
        };
        projection.rotation = {
          x: THREE.Math.radToDeg(projection.mesh.rotation.x),
          y: THREE.Math.radToDeg(projection.mesh.rotation.y),
          z: THREE.Math.radToDeg(projection.mesh.rotation.z),
        };
      }
      return projection;
    };
    this_awe.constructor.prototype.projections.update = function(BODY, HEAD) {
      if (!BODY) { BODY = {}; }
      if (!HEAD) { HEAD = {}; }
      if (BODY.data && BODY.where && BODY.where.id) {
        var fields_updated = [];
        if (BODY.data.position) { fields_updated.push('position'); } 
        if (BODY.data.scale) { fields_updated.push('scale'); } 
        if (BODY.data.rotation) { fields_updated.push('rotation'); } 
        if (fields_updated.length) {
          HEAD.fields_updated = fields_updated;
        }
        if(BODY.data.animation && parseFloat(BODY.data.animation.duration) > 0) {
          _tween(_extend({
            mesh: this_awe.projections.view(BODY.where.id).mesh,
            end_state: BODY.data
          }, BODY.data.animation));
        }
        else {
          BODY.mesh = _update_mesh_io(BODY.data, this_awe.projections.view(BODY.where.id).mesh);
        }
      }
      return this.constructor.prototype.update.call(this, BODY, HEAD); // super
    };
    this_awe.constructor.prototype.projections.delete = function(BODY, HEAD) {
      if (!BODY) { BODY = {}; }
      if (!HEAD) { HEAD = {}; }
      var projection;
      if (typeof BODY == 'string' || typeof BODY == 'number') {
        projection = this_awe.projections.view(BODY);
        BODY = { id: BODY };
      }
      else if (BODY.id) {
        projection = this_awe.projections.view(BODY.id);
      }
      if (projection.mesh) {
        this_awe.scene().remove(projection.mesh);
        _clickable_objects.splice(projection._clickable_object_id, 1);
        this_awe.scene_needs_rendering = 1;
      }
      return this.constructor.prototype.delete.call(this, BODY, HEAD); // super
    };

    this_awe.constructor.prototype.textures = new awe_v8();
    this_awe.constructor.prototype.textures.add = function(BODY, HEAD) {
      if (!BODY) { BODY = {}; }
      if (!HEAD) { HEAD = {}; }
      var id = "texture-"+new Date().getTime()+'-'+Math.round(Math.random()*1000);
      var texture = new THREE.Texture();
      if (BODY.path) {
        var path = undefined;
        var v = document.createElement('video');
        if (Array.isArray(BODY.path)) {
          for (var p in BODY.path) {
            var tmp_path = BODY.path[p];
            var suffix = tmp_path.match(/\.(webm|mp4|ogg|ogv)/i);
            if (suffix) {
              if (suffix[1].toLowerCase() == "ogv") {
                suffix[1] = "ogg";
              }
              var can_play = v.canPlayType("video/"+suffix[1].toLowerCase());
              if (can_play == "probably" || can_play == "maybe") {
                path = BODY.path[p];
                break;
              }
            }
          }
        } else if (BODY.path.match(/\.(webm|mp4|ogg|ogv)/i)) {
          path = BODY.path;
        }
        if (path) {
          if (BODY.width) { 
            v.width = BODY.width; 
          } 
          else { 
            v.width = 320; 
          }
          if (BODY.height) { 
            v.height = BODY.height; 
          } 
          else { 
            v.height = 240; 
          }
          v.src = path;
          var autoplay = true;
          if (BODY.autoplay !== undefined) {
            autoplay = BODY.autoplay;
          }
          v.autoplay = autoplay;
          v.load();
          if (autoplay) {
            v.play();
          }
          if (BODY.loop !== undefined) {
            v.loop = BODY.loop;
          }
          if (BODY.muted !== undefined) {
            v.muted = BODY.muted;
          }

          var c = document.createElement('canvas');
          c.width = v.width;
          c.height = v.height;

          var cc = c.getContext('2d');
          texture = new THREE.Texture(c);
          texture.video = v;
          texture.cc = cc;
        }
        else if (BODY.path.match(/^camerastream$/i)) {
          var v = this_awe.video_stream().video_element;
          if (BODY.width) { 
            v.width = BODY.width; 
          } 
          else { 
            v.width = 320; 
          }
          if (BODY.height) { 
            v.height = BODY.height; 
          }
          else { 
            v.height = 240; 
          }
          v.autoplay = true;
          v.play();
          this_awe.util.connect_stream_to_src(this_awe.video_stream().stream, v);

          var c = document.createElement('canvas');
          c.width = v.width;
          c.height = v.height;

          var cc = c.getContext('2d');
          texture = new THREE.Texture(c);
          texture.video = v;
          texture.cc = cc;
        }
        else {
          texture = THREE.ImageUtils.loadTexture(BODY.path, undefined, function() {
            this_awe.scene_needs_rendering = 1;
          });
        }
        return this.constructor.prototype.add.call(this, { id: id, value: texture }); // super
      }
      else {
        throw { code: 500, message: 'texture.path required' };
      }
    } 

    this_awe.constructor.prototype.materials = new awe_v8();
    this_awe.constructor.prototype.materials.add = function(BODY, HEAD) {
      if (!BODY) { BODY = {}; }
      if (!HEAD) { HEAD = {}; }
      var id = BODY.id || "material-"+new Date().getTime()+'-'+Math.round(Math.random()*1000);
      delete BODY.id;
      var type = BODY.type || 'basic';
      delete BODY.type;
      if (!BODY.wireframe) {
        BODY.wireframe = false;
      }
      if (!BODY.color) {
        BODY.color = 0x404040;
      }
      var side = THREE.DoubleSide;
      if (BODY.side) {
        if (BODY.side == "front") {
          side = THREE.FrontSide;
        }
        else if (BODY.side == "back") {
          side = THREE.BackSide;
        }
        delete BODY.side;
      }
      if (!BODY.overdraw) {
        BODY.overdraw = true;
      }
      var material = new THREE.MeshBasicMaterial(BODY);
      switch(type) {
        case 'phong':
          if (!BODY.shading) {
            BODY.shading = THREE.SmoothShading;
          }
          material = new THREE.MeshPhongMaterial(BODY);
          break;
        case 'lambert':
          material = new THREE.MeshLambertMaterial(BODY);
          break;
        case 'shader':
          material = new THREE.ShaderMaterial(BODY);
          break;
        case 'sprite':
          material = new THREE.SpriteMaterial(BODY);
          break;
        case 'sprite_canvas':
          material = new THREE.SpriteCanvasMaterial(BODY);
          break;
      }
      material.side = side;
      return this.constructor.prototype.add.call(this, { id: id, value: material }); // super
    }

    this_awe.constructor.prototype.sounds = new awe_v8();
    this_awe.constructor.prototype.sounds.add = function(BODY, HEAD) {
      if (this_awe.capabilities.view("audio")) {
        if (!BODY) { BODY = {}; }
        if (!HEAD) { HEAD = {}; }
        var id = BODY.id || "sound-"+new Date().getTime()+'-'+Math.round(Math.random()*1000);
        delete BODY.id;
        if (BODY.autoplay == undefined) {
          BODY.autoplay = true;
        }
        _load_sound(BODY);
        return this.constructor.prototype.add.call(this, { id: id, value: BODY }); // super
      }
    }

    this_awe.constructor.prototype.tween_functions = new awe_v8();
    this_awe.constructor.prototype.tween_functions.add({
      id: 'linear',
      value: function(io) {
        return io.step/io.steps_total;
      }
    });
          
    this_awe.constructor.prototype.setup_scene = function(io) {
      this.origin = new THREE.Vector3(0,0,0);
      this_awe.renderers.add({ id: 'default' });
      this_awe.scenes.add({ id: 'default' });
      this_awe.povs.add({ id: 'default' });
      if (this_awe.settings.view('start_video_stream')) {
        this_awe.setup_stream();
      }
      var lights = this_awe.lights.list();
      if (!lights.length) {
        var default_lights = this_awe.settings.view('default_lights');
        if (default_lights && Array.isArray(default_lights)) { 
          for (var i=0,l=default_lights.length;i<l;i++) {
            try {
            	this_awe.lights.add(default_lights[i]);
            }
            catch(e) {
							this_awe.error_handler(e);
						}
          }
        }
      }
      var aspect_ratio = window.innerWidth / window.innerHeight;
      this_awe.pov().aspect = aspect_ratio;
      this_awe.pov().updateProjectionMatrix();
      this_awe.renderer().setSize(window.innerWidth, window.innerHeight);
      this_awe.scene_needs_rendering = 1;
      _tick();
    };

    this_awe.constructor.prototype.setup_stream = function(io) {
      this_awe.video_streams.add({ id: 'default' });
    };

    this_awe.constructor.prototype.render = function() {
      if (this_awe.scene_needs_rendering) {
        this_awe.renderer().render(this_awe.scene(), this_awe.pov());
        this_awe.scene_needs_rendering = 0;
      }
    };

		function _get_mesh_state(mesh) {
			var accuracy = 7;
			return {
				rotation: {
					x: parseFloat(THREE.Math.radToDeg(mesh.rotation.x).toFixed(accuracy)),
					y: parseFloat(THREE.Math.radToDeg(mesh.rotation.y).toFixed(accuracy)),
					z: parseFloat(THREE.Math.radToDeg(mesh.rotation.z).toFixed(accuracy))
				},
				scale: {
					x: parseFloat(mesh.scale.x.toFixed(accuracy)),
					y: parseFloat(mesh.scale.y.toFixed(accuracy)),
					z: parseFloat(mesh.scale.z.toFixed(accuracy))
				},
				position: {
					x: parseFloat(mesh.position.x.toFixed(accuracy)),
					y: parseFloat(mesh.position.y.toFixed(accuracy)),
					z: parseFloat(mesh.position.z.toFixed(accuracy))
				}
			};
		}
				
		function _extend() {
			var src, copy, name, options,
				target = arguments[0] || {},
				i = 1,
				length = arguments.length;
			if (typeof target !== 'object') {
				target = {};
			}
			for (; i < length; i++) {
				if ((options = arguments[ i ]) != null) {
					for (name in options) {
						src = target[name];
						copy = options[name];
						if (target === copy) {
							continue;
						}
						if (copy !== undefined) {
							target[name] = copy;
						}
					}
				}
			}
			return target;
		}
		
		function _transform(ob) {
			ob = ob ? ob : {};
			var def = {
				rotation: {
					x: 0,
					y: 0,
					z: 0
				},
				scale: {
					x: 1,
					y: 1,
					z: 1
				},
				position: {
					x: 0,
					y: 0,
					z: 0
				}
			};
			this.rotation = _extend(def.rotation, ob.rotation);
			this.scale = _extend(def.scale, ob.scale); 
			this.position = _extend(def.position, ob.position);	 
			return this;
		};

		_transform.prototype.data = function(ob) {
			return {
				rotation: this.rotation,
				scale: this.scale,
				position: this.position
			};
		};

		_transform.prototype.add = function(ob) {
			if (ob.rotation) {
				this.rotation.x += ob.rotation.x || 0;
				this.rotation.y += ob.rotation.y || 0;
				this.rotation.z += ob.rotation.z || 0;
			}
			if (ob.scale) {
				this.scale.x *= ob.scale.x || 1;
				this.scale.y *= ob.scale.y || 1;
				this.scale.z *= ob.scale.z || 1;
			}
			if (ob.position) {
				this.position.x += ob.position.x || 0;
				this.position.y += ob.position.y || 0;
				this.position.z += ob.position.z || 0;
			}
			return this;
		};

		function _validate_shape(geometry) {
			var io = {};
			if (!geometry.shape) {
				return io;
			}
			switch(geometry.shape) {
				case 'cube': 
					io = {
						x: 1,
						y: 1,
						z: 1
					};
					break;
				case 'plane': 
					io = {
						width: 1,
						height: 1,
						widthSegments: 1,
						heightSegments: 1
					};
				case 'text': 
					io = {
						text: 'theAWEsomeWEB'
					};
					break;
			}
			for (var i in geometry) {
				io[i] = geometry[i];
			}
			return io;
		}
		
		function _update_mesh_io(io, mesh, new_object) {
			if (!io) {
				io = {};
			}
			
			if (!io.geometry) {
				io.geometry = {};
			}
			if (!io.material) {
				io.material = {};
			}
			var render = false;
			if (!mesh) {
				if (this_awe.settings.view('renderer') == 'webgl') {
					if (this_awe.capabilities.view('webgl')) {
						var geometry = new THREE.CubeGeometry(io.geometry.x, io.geometry.y, io.geometry.z);
						var material_id = this_awe.materials.add(io.material);
						var material = this_awe.materials.view(material_id);
						mesh = io.mesh || new THREE.Mesh(geometry, material);
						render = true;
					}
					else {
						throw { code: 500, message: 'webgl object creation failed' };
					}
				}
				else if (this_awe.settings.view('renderer') == 'css3d') {
					if (this_awe.capabilities.view('css3d')) {
						var element = document.createElement('div');
						element.style.width = io.geometry.x+'px' || '0px';
						element.style.height = io.geometry.y+'px' || '0px';
						element.style.background = '#666666';
						if (io.geometry.x == 0) {
							element.style.opacity = '0';
						}
						else {
							element.style.opacity = '1';
						}
						mesh = io.mesh ||	new THREE.CSS3DObject(element);
						render = true;
					}
					else {
						throw { code: 500, message: 'css3d object creation failed' };
					}
				}
				else {
					throw { code: 500, message: 'renderer not defined' };
				}
			}
			if (io.scale) {
				if (io.scale.x !== undefined) { 
					mesh.scale.x = io.scale.x; 
				}
				else if (new_object) { 
					mesh.scale.x = 1; 
				}
				if (io.scale.y !== undefined) { 
					mesh.scale.y = io.scale.y; 
				}
				else if (new_object) { 
					mesh.scale.y = 1; 
				}
				if (io.scale.z !== undefined) { 
					mesh.scale.z = io.scale.z; 
				}
				else if (new_object) { 
					mesh.scale.z = 1; 
				}
				delete io.scale;
				render = true;
			}
			if (io.rotation) {
				if (io.rotation.x !== undefined) { 
					mesh.rotation.x = THREE.Math.degToRad(io.rotation.x); 
				}
				else if (new_object) { 
					mesh.rotation.x = 0; 
				}
				if (io.rotation.y !== undefined) { 
					mesh.rotation.y = THREE.Math.degToRad(io.rotation.y); 
				}
				else if (new_object) { 
					mesh.rotation.y = 0; 
				}
				if (io.rotation.z !== undefined) { 
					mesh.rotation.z = THREE.Math.degToRad(io.rotation.z); 
				}
				else if (new_object) { 
					mesh.rotation.z = 0; 
				}
				delete io.rotation;
				render = true;
			}
			if (io.position) {
				if (io.position.x !== undefined) { 
					mesh.position.x = io.position.x; 
				}
				else if (new_object) { 
					mesh.position.x = 0; 
				}
				if (io.position.y !== undefined) { 
					mesh.position.y = io.position.y; 
				}
				else if (new_object) { 
					mesh.position.y = 0; 
				}
				if (io.position.z !== undefined) { 
					mesh.position.z = io.position.z; 
				}
				else if (new_object) { 
					mesh.position.z = 0; 
				}
				delete io.position;
				render = true;
			}
			if (!mesh.overdraw) {
				try {
					mesh.overdraw = true;
					render = true;
				}
				catch(e) { /* TODO */ };
			}
			if (io.visible !== undefined) {
				mesh.visible = io.visible;
				for (var proj in mesh.children) {
					mesh.children[proj].visible = io.visible;
				}
				render = true;
			}
			if (io.cast_shadow !== undefined) {
				mesh.castShadow = io.cast_shadow;
				render = true;
			}
			if (io.receive_shadow !== undefined) {
				mesh.receiveShadow = io.receive_shadow;
				render = true;
			}
			if (io.matrix_auto_update !== undefined) {
				mesh.matrixAutoUpdate = io.matrix_auto_update;
				render = true;
			}
			if (io.custom_matrix !== undefined) {
				mesh.customMatrix = io.custom_matrix;
				render = true;
			}
			if (io.euler_order !== undefined) {
				mesh.rotation.order = io.euler_order;
				render = true;
			}
			if (io.matrix !== undefined) {
				try {
					mesh.matrixAutoUpdate = false;
					mesh.matrix.setFromArray(io.matrix);
					mesh.matrixWorldNeedsUpdate = true;
					render = true;
				}
				catch(e) { /* TODO */ };
			}
			if (io.material.color !== undefined) {
				try {
					mesh.material.color.setHex(io.material.color);
				}
				catch(e) { /* TODO */ };
			}
			if (io.material.opacity !== undefined) {
				try {
					mesh.material.opacity = io.material.opacity;
				}
				catch(e) { /* TODO */ };
			}
			if (io.material.transparent !== undefined) {
				try {
					mesh.material.transparent = io.material.transparent;
				}
				catch(e) { /* TODO */ };
			}
			if (io.material.wireframe !== undefined) {
				try {
					mesh.material.wireframe = io.material.wireframe;
				}
				catch(e) { /* TODO */ };
			}
			if (io.material.fog !== undefined) {
				try {
					mesh.material.fog = io.material.fog;
				}
				catch(e) { /* TODO */ };
			}
			if (render) {
				this_awe.scene_needs_rendering = 1;
			}
			delete io.geometry;
			return mesh;
		}
		
		var tween_queue = [],
			last_time,
			dt;
		
		function _tween(io) {
			if (!io.mesh || !io.end_state) { 
				return;
			}

			if (tween_queue[io.mesh.id]) {
				console.log('already animating this mesh - sorry!')
				return;
			}
			
			io = _extend({
				duration: 1, // seconds
				delay: 0,
				persist: 1,
				repeat: 0
			}, io);
			
			var start_state = _get_mesh_state(io.mesh);
			var steps_total = this_awe.settings.view('fps') * io.duration;
			var steps = [];
			var ts = (io.duration * 1000) / steps_total;
			var get_increment = this_awe.tween_functions.view('linear');
			if (io.interpolation) {
				try {
					var f = this_awe.tween_functions.view(io.interpolation);
					if (typeof(f) == 'function') {
						get_increment = f;
					}
				}
				catch(e) { /* TODO */ };
			}
			
			var get_step_data = function(increment) {
				var transform = {};
				if (io.end_state.rotation && typeof(io.end_state.rotation) == 'object') {
					transform.rotation = {};
				}
				if (io.end_state.scale && typeof(io.end_state.scale) == 'object') {
					transform.scale = {};
					if (!isNaN(io.end_state.scale.x)) {
						transform.scale.x = parseFloat(start_state.scale.x) + (parseFloat(io.end_state.scale.x) - parseFloat(start_state.scale.x)) * increment;
					}
					if (!isNaN(io.end_state.scale.y)) {
						transform.scale.y = parseFloat(start_state.scale.y) + (parseFloat(io.end_state.scale.y) - parseFloat(start_state.scale.y)) * increment;
					}
					if (!isNaN(io.end_state.scale.z)) {
						transform.scale.z = parseFloat(start_state.scale.z) + (parseFloat(io.end_state.scale.z) - parseFloat(start_state.scale.z)) * increment;
					}
				}
				if (io.end_state.rotation && typeof(io.end_state.rotation) == 'object') {
					transform.rotation = {};
					if (!isNaN(io.end_state.rotation.x)) {
						transform.rotation.x = parseFloat(start_state.rotation.x) + (parseFloat(io.end_state.rotation.x) - parseFloat(start_state.rotation.x)) * increment;
					}
					if (!isNaN(io.end_state.rotation.y)) {
						transform.rotation.y = parseFloat(start_state.rotation.y) + (parseFloat(io.end_state.rotation.y) - parseFloat(start_state.rotation.y)) * increment;
					}
					if (!isNaN(io.end_state.rotation.z)) {
						transform.rotation.z = parseFloat(start_state.rotation.z) + (parseFloat(io.end_state.rotation.z) - parseFloat(start_state.rotation.z)) * increment;
					}
				}
				if (io.end_state.position && typeof(io.end_state.position) == 'object') {
					transform.position = {};
					if (!isNaN(io.end_state.position.x)) {
						transform.position.x = parseFloat(start_state.position.x) + (parseFloat(io.end_state.position.x) - parseFloat(start_state.position.x)) * increment;
					}
					if (!isNaN(io.end_state.position.y)) {
						transform.position.y = parseFloat(start_state.position.y) + (parseFloat(io.end_state.position.y) - parseFloat(start_state.position.y)) * increment;
					}
					if (!isNaN(io.end_state.position.z)) {
						transform.position.z = parseFloat(start_state.position.z) + (parseFloat(io.end_state.position.z) - parseFloat(start_state.position.z)) * increment;
					}
				}
				return {
					ts: ts,
					transform: transform
				};
			}
			
			for (var k=0; k<steps_total; k++) {
				var increment = get_increment({
					step: k,
					steps_total: steps_total
				});
				var step = get_step_data(increment);
				steps.push(step);
			}
			var tween_data = {
				mesh: io.mesh,
				data: {
					advancement: 0,
					steps: steps,
					end_state: io.end_state,
					repeat: io.repeat ? parseInt(io.repeat, 10) : 0,
					delay: io.delay,
					end_callback: io.end_callback,
					step_callback: io.step_callback,
					start_callback: io.start_callback,
					start_state: start_state,
					persist: io.persist
				}
			};
			if (io.delay && parseFloat(io.delay)) {
				setTimeout(function(){
					tween_queue[io.mesh.id] = tween_data;
				}, io.delay*1000);
			}
			else {
				tween_queue[io.mesh.id] = tween_data;
			}
		}
		
		function _finish_tween(mesh_id) {
			var data = tween_queue[mesh_id].data;
      var mesh = tween_queue[mesh_id].mesh;
			delete(tween_queue[mesh_id]);
			if (data.end_callback && typeof(data.end_callback) == 'function') {
				data.end_callback({
					mesh: mesh
				})
			}
		}

    function _load_sound(io) {
      if (io.path == undefined) {
        throw 'url required';
      }
      var request = new XMLHttpRequest();
      request.open('GET', io.path, true);
      request.responseType = 'arraybuffer';
      request.onload = function() {
        this_awe.util.audio_context.decodeAudioData(request.response, function(new_buffer) {
          io.buffer = new_buffer;
          if (io.autoplay) {
            _play_sound(io);
          }
          if (io.callback) {
            try {
              io.callback(io);
            }
            catch(e) {  };
          }
        }, function(e) { console.log(e); });
      }
      request.send();
    }

    function _play_sound(io) {
      if (io.source == undefined) {
        throw 'source required'; 
      }
      if (io.buffer == undefined) {
        throw 'buffer required'; 
      }
      try {
        io.source.buffer = io.buffer;
        if (io.loop == undefined) {
          io.source.loop = true;
        }
        else {
          io.source.loop = io.loop;
        }
        io.source.start(io.start || 0.0);
      }
      catch(e) { };
    }

    function _map_audio_listener_to_pov() {
      if (this_awe.capabilities.view("audio")) {
        var m = this_awe.pov().matrix;
        var mx = m.n14, my = m.n24, mz = m.n34;
        m.n14 = m.n24 = m.n34 = 0;
        var vec = new THREE.Vector3(0,0,1);
        m.multiplyVector3(vec);
        vec.normalize();
        var up = new THREE.Vector3(0,1,0);
        m.multiplyVector3(up);
        up.normalize();
        this_awe.util.audio_context.listener.setOrientation(vec.x, vec.y, vec.z, up.x, up.y, up.z);
        m.n14 = mx;
        m.n24 = my; 
        m.n34 = mz;
      }
    }

		function _tick() {
			try {
				var textures = this_awe.textures.list();
				for (texture in textures) {
					if (textures[texture]) {
						var t = textures[texture].value;
						if (t.video && t.video.readyState === t.video.HAVE_ENOUGH_DATA) {
							if (t.cc) {
								try {
									t.cc.drawImage(t.video, 0, 0, t.cc.canvas.width, t.cc.canvas.height);
									t.needsUpdate = true;
									this_awe.scene_needs_rendering = 1;
								}
								catch(e) { /* TODO */ };
							}
						}
					}
				}
				
				var now = (new Date()).getTime(),
					dt = now - (last_time || now); 
				last_time = now;
				if (tween_queue.length) {
					for (var i in tween_queue) {
						var mesh_id = i,
							transform_data = tween_queue[i].data,
							mesh = tween_queue[i].mesh,
							count = 0,
							transform = new _transform(),
							steps_total = transform_data.steps.length,
							step;
							
						if (transform_data.current_step === undefined) {
							transform_data.current_step = 0;
							// start callback
							if (transform_data.start_callback && typeof(transform_data.start_callback) == 'function') {
								transform_data.start_callback({
									mesh: mesh
								});
							}
						}
						if (!mesh) {
							console.log('no mesh')
							continue;
						}
						var min_ts = transform_data.advancement;
						var max_ts = transform_data.advancement+dt;
						for (var j=0; j<steps_total; j++) {
							var s = transform_data.steps[j],
								tr = s.transform,
								ts = s.ts;
							count += ts;
							if (count > min_ts && count <= max_ts) {
								step = j;
								transform.add(tr);
							}
						}
						transform_data.advancement = max_ts;
						if (!isNaN(step) && step != transform_data.current_step) {
							try {
								var current_transform = _get_mesh_state(mesh);
								var n = transform.data();
								_update_mesh_io(_extend({}, transform_data.steps[step].transform), mesh);
								this_awe.scene_needs_rendering = 1;
								transform_data.current_step = step;
								// step callback
								if (transform_data.step_callback && typeof(transform_data.step_callback) == 'function') {
									transform_data.step_callback({
										mesh: mesh,
										step: step,
										steps_total: steps_total
									});
								}
							}
							catch(e) {
								this_awe.error_handler(e);
							}
						}
						if (step && step == transform_data.steps.length-1) {
							if (!isNaN(transform_data.repeat) && transform_data.repeat > 1) {
								transform_data.repeat--;
								var start_state = _extend({}, transform_data.start_state);
								_update_mesh_io(start_state, mesh);
								transform_data.advancement = 0;
								delete(transform_data.current_step);
								if (transform_data.end_callback && typeof(transform_data.end_callback) == 'function') {
									transform_data.end_callback({
										mesh: mesh
									});
								}
							}
							else if (!parseInt(transform_data.persist, 10)) {
								var start_state = _extend({}, transform_data.start_state);
								_update_mesh_io(start_state, mesh);
								_finish_tween(mesh.id);
							}
							else {
								_update_mesh_io(_extend({}, transform_data.end_state), mesh);
								_finish_tween(mesh_id);
							}
						}
					}
				}

				this_awe.render(); 

				requestAnimationFrame(function() {
					_tick();
					var event = new CustomEvent('tick');
					window.dispatchEvent(event);
				});
			} 
			catch(e) {
				this_awe.error_handler(e);
			}
		}

		this_awe.util.extend = _extend;
	} else {
    throw "awe does not exist";
  }
})(window);
