varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudTexture;
uniform vec3 uSunDirection;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // sun 
    // vec3 sunDirection = vec3(0., 0., 1.);
    float sunOrientation = dot(uSunDirection, normal);

    // day / night -> texture
    float dayMix = smoothstep( -.25, .5, sunOrientation);
    vec3 dayColor = texture(uDayTexture, vUv).rgb;
    vec3 nightColor = texture(uNightTexture, vUv).rgb;
    vec3 specrularColor = texture(uSpecularCloudTexture, vUv).rgb;
    color = mix( nightColor, dayColor, dayMix);

    // color += dayColor;
    // color += specrularColor;
    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}