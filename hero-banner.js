const container = document.getElementById('webgl-overlay');
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        
        // Set the renderer size to the window size initially
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 1;

        const video = document.querySelector('.background-video');
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBFormat;

        const uniforms = {
            videoTexture: { value: videoTexture },
            mouse: { value: { x: 0.5, y: 0.5 } },
            time: { value: 0 },
        };

        const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
        `;

        const fragmentShader = `
        uniform sampler2D videoTexture;
        uniform vec2 mouse;
        uniform float time;
        varying vec2 vUv;

        float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
            vec2 uv = vUv;

            float distToMouse = distance(uv, mouse);
            float mouseEffect = smoothstep(0.15, 0.0, distToMouse);
            vec2 turbulence = vec2(
                noise(uv * 0.1 + time * 0.1),
                noise(uv * 5.0 - time * 0.1)
            ) * 0.5;

            turbulence += vec2(
                noise(uv * 7.0 + time * 0.05),
                noise(uv * 7.0 - time * 0.05)
            ) * 0.01;

            uv += turbulence * (0.1 - mouseEffect);

            vec4 color = texture2D(videoTexture, uv);

            vec3 black = vec3(0.0, 0.0, 0.0);
            vec3 darkBlue = vec3(0.0, 0.0, 0.07);
            vec3 blendedColor = mix(black, darkBlue, mouseEffect);

            color.rgb = color.rgb * (1.0 - mouseEffect) + blendedColor * mouseEffect;

            gl_FragColor = color;
        }
        `;

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
        });

        const aspect = window.innerWidth / window.innerHeight;
        const geometry = new THREE.PlaneGeometry(aspect * 2, aspect * 2);
        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);

        let targetMouseX = 0;
        let targetMouseY = 0;
        let currentMouseX = 0;
        let currentMouseY = 0;
        const smoothness = 0.05;

        window.addEventListener('load', () => {
            targetMouseX = 0.5;  // Center of the screen
            targetMouseY = 0.5;
        });

        window.addEventListener('mousemove', (event) => {
            targetMouseX = event.clientX / window.innerWidth;
            targetMouseY = 1 - (event.clientY / window.innerHeight);
        });

        function updateMousePosition() {
            currentMouseX += (targetMouseX - currentMouseX) * smoothness;
            currentMouseY += (targetMouseY - currentMouseY) * smoothness;
            uniforms.mouse.value.x = currentMouseX;
            uniforms.mouse.value.y = currentMouseY;
        }

        // Ensure the video is updating continuously
        videoTexture.needsUpdate = true;

        // Event listener to ensure the video plays continuously
        video.addEventListener('play', () => {
            video.play();
        });

        // Handle window resizing
        window.addEventListener('resize', () => {
            // Resize the renderer to the window's current dimensions
            renderer.setSize(window.innerWidth, window.innerHeight);

            // Adjust the aspect ratio of the camera
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            // Adjust the geometry of the plane according to the new aspect ratio
            const aspect = window.innerWidth / window.innerHeight;
            plane.geometry.dispose();
            plane.geometry = new THREE.PlaneGeometry(2, 2);
        });

        function animate() {
            requestAnimationFrame(animate);

            // Continuously ensure the video texture is updated
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                videoTexture.needsUpdate = true;
            }

            updateMousePosition();
            uniforms.time.value += 0.05;
            
            renderer.render(scene, camera);
        }

        animate();