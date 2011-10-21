(function() {
    var container
      , stats
      , camera
      , cameraTarget
      , scene
      , projector
      , renderer
      , particles
      , mouse2D
      , ay = 0
      , ax = Math.PI/4
      , spinRadius = 1500
      , particleCount = 20000
      , particlesPerBatch = 5
      , particleIndex = 0
      , lookVector = new THREE.Vector3(0, 0, 0)
      , input = {
            left: false,
            right: false,
            up: false,
            down: false,
            shift: false,
            mouseDown: false
        }
      , socket = io.connect();

    function init() {
        if (!Detector.webgl) {
            Detector.addGetWebGLMessage();
            return;
        }

        container = document.createElement('div');
        document.body.appendChild(container);

        camera = new THREE.CombinedCamera(window.innerWidth, window.innerHeight, 45, 1, 10000, -2000, 10000);
        camera.position.z = 1400;
        cameraTarget = new THREE.Vector3(0, 0, 0);
        scene = new THREE.Scene();
        //scene.fog = new THREE.FogExp2(0x000000, 0.0009);
        projector = new THREE.Projector();
        var geometry = new THREE.Geometry();
        
        var colors = [];
        geometry.colors = colors;
        for (var i = 0, l = particleCount; i < l; ++i) {
            geometry.vertices.push(new THREE.Vertex(new THREE.Vector3(0, 10000, 0)));
            colors[i] = new THREE.Color(0xffffff);
            colors[i].setHSV(i/particleCount, 1.0, 1.0);
        }
        var material = new THREE.ParticleBasicMaterial({color: 0xFFFFFF, size: 64, map: THREE.ImageUtils.loadTexture('particle.png'), blending: THREE.AdditiveBlending, transparent: true, vertexColors: true});
        material.color.setHSV(1.0, 0.2, 0.8);
        particles = new THREE.ParticleSystem(geometry, material);
        particles.sortParticles = true;
        particles.updateMatrix();
        scene.add(particles);
        
        var plane = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000, 20, 20), new THREE.MeshBasicMaterial({color: 0x555555, wireframe: true}));
        plane.rotation.x = -Math.PI/2;
        scene.add(plane); 
        
        renderer = new THREE.WebGLRenderer({ clearAlpha: true, antialias: true });
        //renderer.setClearColor(new THREE.Color(0, 1));
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);
        
        mouse2D = new THREE.Vector3(0, 10000, 0.5);

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        container.appendChild(stats.domElement);
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mousedown', onMouseDown, false);
        document.addEventListener('mouseup', onMouseUp, false);
        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);
        window.addEventListener('resize', onWindowResize, false);

        socket.on('p', plot);
        animate();
    }

    function onMouseMove(event) {
        mouse2D.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse2D.y = -(event.clientY / window.innerHeight) * 2 + 1;
        if (!input.mouseDown) return;
        var ray = projector.pickingRay(mouse2D.clone(), camera);
        var intersects = ray.intersectScene(scene);
        if (intersects.length > 0) {
            var intersector = getRealIntersector(intersects);
            if (intersector) {
                var s = [];
                for (var i = 0; i < particlesPerBatch; ++i) {
                    s.push([
                        intersector.point.x + Math.random() * 5, 
                        intersector.point.z + Math.random() * 5
                    ]);
                }
                plot(s, true);
            }
        }
    }

    function plot(data, send) {
        for (var i = 0, l = Math.min(particlesPerBatch, data.length); i < l; ++i) {
            var v = particles.geometry.vertices[particleIndex];
            particleIndex = particleIndex < particleCount-1 ? particleIndex + 1 : 0;
            try {
                v.position.x = data[i][0];
                v.position.y = 0;
                v.position.z = data[i][1];
                v.__vaporDelay = 300;
            } 
            catch(e) {}
        }
        if (send) socket.emit('p', s);
    }

    function onMouseDown() {
        input.mouseDown = true; 
    }

    function onMouseUp() {
        input.mouseDown = false; 
    }

    function onKeyDown(event) {
        if (event.which == 39) input.right = true;
        else if (event.which == 37) input.left = true;
        else if (event.which == 40) input.down = true;
        else if (event.which == 38) input.up = true;
        else if (event.which == 16) input.shift = true;
    }

    function onKeyUp(event) {
        if (event.which == 39) input.right = false;
        else if (event.which == 37) input.left = false;
        else if (event.which == 40) input.down = false;
        else if (event.which == 38) input.up = false;
        else if (event.which == 16) input.shift = false;
    }

    function onWindowResize(event) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
        stats.update();
    }

    function getRealIntersector(intersects) {
        for(i = 0; i < intersects.length; i++) {
            var intersector = intersects[i];
            return intersector;
        }
        return null;
    }

    function processKeys() {
        if (input.up == true) {
            if (input.shift) {
                if (lookVector.z <= 1000) lookVector.z += 100;
            }
            else if (spinRadius > 100) spinRadius -= 100;
        }
        else if (input.down == true) {
            if (input.shift) {
                if (lookVector.z >= -1000) lookVector.z -= 100;
            }
            else spinRadius += 100;
        }
        if (input.right == true) {
            if (input.shift) {
                if (lookVector.x <= 1000) lookVector.x += 100;
            }
            else ay += .1;
        }
        else if (input.left == true) {
            if (input.shift) {
                if (lookVector.x >= -1000) lookVector.x -= 100;
            }
            else ay -= .1;
        }
    }

    function render() {
        processKeys();
        var radius = Math.sin(ax) * spinRadius;
        cameraTarget.x += (lookVector.x - cameraTarget.x) * 0.05;
        cameraTarget.z += (lookVector.z - cameraTarget.z) * 0.05;
        camera.position.x += (cameraTarget.x + Math.sin(ay) * radius - camera.position.x) * 0.05;
        camera.position.z += (cameraTarget.z + Math.cos(ay) * radius - camera.position.z) * 0.05;
        camera.position.y += (Math.cos(ax) * spinRadius - camera.position.y) * 0.05;
        camera.lookAt(cameraTarget);
        for (var i = 0, l = particles.geometry.vertices.length; i < l; ++i) {
            var p = particles.geometry.vertices[i];
            if (p.position.y < 10000) {
                if (p.__vaporDelay && p.__vaporDelay > 0) {
                    p.__vaporDelay -= 1;
                    continue;
                }
                //p.position.x += Math.random() * 3;
                //p.position.z += Math.random() * 3;
                p.position.y += Math.random() * 3;
            }
        }
        particles.geometry.__dirtyVertices = true;
        renderer.render(scene, camera);
    }

    window.plot = plot; // might as well let people script the particle plotting
})();
