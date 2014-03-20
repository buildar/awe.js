awe.js
======

What is awe.js?
---------------
It's the quickest and easiest way to create Augmented Web applications.

Checkout our demos showing AR in standard web browsers:
- Location based AR http://youtu.be/OJHgBSRJNJY
- Marker based AR http://youtu.be/X_XR9VbQPeE
- Oculus Rift based AR http://youtu.be/kIHih4Cc1ag
- Leap Motion Sensor AR http://youtu.be/mDbvPU4aokQ
- Google Glass AR http://youtu.be/M97E2m6dRO4

What is the Augmented Web?
--------------------------
It's what comes after html5!

It uses WebRTC, WebGL and the modern sensor APIs to bring Augmented Reality and so much more to the web platform. It will completely change the way you and your users see the web.


How do you create an awe.js app?
--------------------------------
You can <a href="https://buildar.com/awe/tutorials/intro_to_awe.js/index.html">checkout the "Intro to awe.js" tutorial</a>. Or just follow the basic overview below.

Just add a `<script src='js/awe.js'></script>` tag to your html page to turn that page into an Augmented Web application.

Now you are ready to create adaptive Augmented Web Experiences. `awe.js` allows you to easily create and manage 3d objects, add and manage Video and Audio streams and integrate automatic handling of sensor driven data feeds.

See the `examples/` and and their plugins for more details.

To initialize your `awe.js` application just call: 

```
awe.init({
  ...
});
```

Once the `awe_ready` event is fired then your `awe.js` app is ready to start. Then you can call `awe.setup_scene()` to setup your scene. NOTE: This must be called after `awe_ready` has been fired.

To see this working try loading `examples/geo_ar/index.html` in a suitable standards compliant browser.

NOTE: For more information on why Chrome and Opera aren't currently supported by this GEO AR demo please see this post to the W3C GeoLocation Working Group - http://lists.w3.org/Archives/Public/public-geolocation/2014Jan/0000.html


How do you add objects to your scene?
-------------------------------------
The `awe.js` API is consistently built upon a simple CRUD like model but the common actions are named `list`, `add`, `view`, `update` and `delete` - see the `v8.js` file included in the top of `js/awe.js` for more detailed information.

Each `awe.js` application consists of a 3d scene and into that scene you can add points of interest or pois. Each poi marks out a point in space that is important or useful for some reason. This can be the location of an object or it might be a point where a recognised object or marker is currently sitting. Then you can attach different types of media (e.g. 3d objects, videos, images and sounds) to each poi and these pieces of media are called projections.

To add an object (point of interest) into your scene just call:

```
awe.pois.add({ id: 'my_first_poi' });
```

To see all the points of interest in the scene call:

```
awe.pois.list();
```

To see the first poi you created call: 

```
var poi = awe.pois.view('my_first_poi');
```

To see all the projections in the scene call:

```
awe.projections.list();
```

To rotate a poi and all it's children projections just call:

```
awe.pois.update({
  data:{
    rotation:{
      y:180
    }
  },
  where:{
    id:'my_first_poi'
  }
});
```

NOTE: It's important that you only manipulate your pois and projections using the `awe.js` interface (e.g. `awe.pois.update({ data:{...}, where:{...} }`) otherwise you will miss out on all the `awe.js` automagic goodness.


Example pois.add data structure	
-------------------------------
```
{
  id: 'projection_name',
  scale: { x:1, y:1, z:1 },
  position: { x:1, y:1, z:1 },
  rotation: { x:0, y:0, z:0 },
  projections: [{ ... }],
  visible: true,
}
```

Example projections.add data structure	
--------------------------------------
```
{
  id: 'projection_name',
  scale: { x:1, y:1, z:1 },
  position: { x:1, y:1, z:1 },
  rotation: { x:0, y:0, z:0 },
  geometry: { shape:'cube', x:10, y:10, z:10 },
  material: { color:0xFF0000, opacity:1.0, transparent:true, wireframe:false, fog:true },
  texture: { path:'blah.jpg' },
  visible: true,
  cast_shadow: true,
  receive_shadow: true,
},
{
  poi_id:'poi_name',
}
```

What's next
-----------
Over the next few weeks and months we will be adding a lot of new examples and tutorials here on github. You can stay tuned by following http://twitter.com/buildAR for more information and don't forget to checkout the video of our Geo AR demo http://youtu.be/OJHgBSRJNJY, our Marker AR demo http://youtu.be/X_XR9VbQPeE, our GRiftAR (gUM + Rift + awe.js) demo http://youtu.be/kIHih4Cc1ag, our Leap Motion Sensor AR demo http://youtu.be/mDbvPU4aokQ and our Google Glass AR demo http://youtu.be/M97E2m6dRO4 

Welcome to the future of the web - the Augmented Web!


Thanks
------
We'd like to thank the developers of all the amazing libraries that we've built awe.js upon. First and foremost is https://github.com/mrdoob and all the contributors that created three.js. It's an outstanding library that sits at the heart of our framework. Second is https://github.com/kig for porting ARToolkit to javascript. We'd also like to thank the team from https://github.com/Instrument for making their oculus-bridge project open source and enabling web based interaction with the Rift. And we'd like to thank https://github.com/auduno and all the contributors to the libraries he used for his head and face tracking libs. Without all of these generous developers, the developers that build the Web browsers we rely upon and all of the people that have contributed to all the open Web standards we use, the Augmented Web would not be possible.


Known issues
------------
- DeviceOrientation API varies wildly across browsers. Chrome M33 is now spec compliant. Firefox is not necessarily spec compliant but does deliver a good UX. Testing on other browsers and working with all the vendors and the W3C GeoLocation Working Group continues.
- Canvas/Video size updating in Firefox on the Marker AR example is somewhat borken leading to skewed tracking. Debugging continues.
- .update() with visible:false doesn't get applied to all the children in .obj models/meshes for projections. Debugging continues.
- Video textures don't work on Chrome M32/M33. Bug raised.
- Spatialised audio has problems on Android browsers. Debugging continues.
- Spatialised audio doesn't play on Firefox when location is 0,0,0. Bug raised.
- Examples can take a while to load on some networks so we they need a nice loading indicator/spinner.
