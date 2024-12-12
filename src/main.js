import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import earthVertexShader from './shaders/earth/vertex.glsl?raw'
import earthFragmentShader from './shaders/earth/fragment.glsl?raw'
import atmosphereVertexShader from './shaders/atmosphere/vertex.glsl?raw'
import atmosphereFragmentShader from './shaders/atmosphere/fragment.glsl?raw'


/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()

//textures
const earthDayTexture = textureLoader.load('./earth/day.jpg')
earthDayTexture.colorSpace = THREE.SRGBColorSpace
earthDayTexture.anisotropy = 8

const earthNightTexture = textureLoader.load('./earth/night.jpg')
earthNightTexture.colorSpace = THREE.SRGBColorSpace
earthNightTexture.anisotropy = 8

const earthSpecularCloudsTexture = textureLoader.load('./earth/specularClouds.jpg')
earthSpecularCloudsTexture.colorSpace - THREE.SRGBColorSpace
earthSpecularCloudsTexture.anisotropy = 8

/**
 * Earth
 */
// Mesh

// Atmosphere colors
const earthPrameters = {}
earthPrameters.atmosphereDayColor = '#00aaff'
earthPrameters.atmosphereTwilightColor = '#ff6600'


const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
const earthMaterial = new THREE.ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms:
    {
        uDayTexture: new THREE.Uniform(earthDayTexture),
        uNightTexture: new THREE.Uniform(earthNightTexture),
        uSpecularCloudTexture: new THREE.Uniform(earthSpecularCloudsTexture),
        uSunDirection: new THREE.Uniform( new THREE.Vector3()),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color( earthPrameters.atmosphereDayColor)),
        uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color( earthPrameters.atmosphereTwilightColor))
    }
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial)
scene.add(earth)

//Atmosphere
const atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    uniforms: {
        uSunDirection: new THREE.Uniform( new THREE.Vector3()),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color( earthPrameters.atmosphereDayColor)),
        uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color( earthPrameters.atmosphereTwilightColor))
    },  
    side: THREE.BackSide,
    transparent: true
})
const atmosphere = new THREE.Mesh(earthGeometry,atmosphereMaterial)
atmosphere.scale.set(1.04, 1.04, 1.04)
scene.add(atmosphere)


/**
 * Sun
 */
//coordinates

const debugSun = new THREE.Mesh(
    new THREE.IcosahedronGeometry(.1, 2),
    new THREE.MeshBasicMaterial()

)
scene.add(debugSun)

const sunSperical = new THREE.Spherical(1, Math.PI * .5, .5)
const sunDirection = new THREE.Vector3()

function updateSun(){
    sunDirection.setFromSpherical(sunSperical)
    debugSun.position.copy(sunDirection)
        .multiplyScalar(5)
    earthMaterial.uniforms.uSunDirection.value.copy(sunDirection)
    atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection)
}
updateSun()

gui.add(sunSperical, 'phi')
    .min(0)
    .max( Math.PI)
    .onChange(updateSun)
gui.add(sunSperical, 'theta')
    .min(-Math.PI)
    .max( Math.PI)
    .onChange(updateSun)

gui.addColor(earthPrameters, 'atmosphereDayColor').onChange( ()=> {
    earthMaterial.uniforms.uAtmosphereDayColor.value.set(earthPrameters.atmosphereDayColor)
    atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(earthPrameters.atmosphereDayColor)
})

gui.addColor(earthPrameters, 'atmosphereTwilightColor').onChange( ()=> {
    earthMaterial.uniforms.uAtmosphereDayColor.value.set(earthPrameters.atmosphereTwilightColor)
    atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(earthPrameters.atmosphereTwilightColor)
})

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})
 
/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 12
camera.position.y = 5
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)
renderer.setClearColor('#000011')

// console.log( renderer.capabilities.getMaxAnisotropy())

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    earth.rotation.y = elapsedTime * 0.1

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()