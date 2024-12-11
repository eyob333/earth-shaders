varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudTexture;
uniform vec3 uSunDirection;
uniform vec3 uAtmosphereTwilightColor;
uniform vec3 uAtmosphereDayColor;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // Specular
    vec2 specrularColor = texture(uSpecularCloudTexture, vUv).rg;

    // sun 
    // vec3 sunDirection = vec3(0., 0., 1.);
    float sunOrientation = dot(uSunDirection, normal);

    // day / night -> texture
    float dayMix = smoothstep( -.25, .5, sunOrientation);
    vec3 dayColor = texture(uDayTexture, vUv).rgb;
    vec3 nightColor = texture(uNightTexture, vUv).rgb;
    color = mix( nightColor, dayColor, dayMix);

    // Cloud
    float cloudMix = smoothstep(.5, 1., specrularColor.g);
    cloudMix *= dayMix;
    color = mix(color, vec3(1.), cloudMix);

    //Fresnel 
    float fresnel = dot( viewDirection, normal) + 1.;
    fresnel = pow(fresnel, 2.);

    // Atmosphere
    float atmospherDayMix = smoothstep( -.5, 1., sunOrientation);
    vec3 atmosphereColorMix = mix( uAtmosphereTwilightColor, uAtmosphereDayColor, atmospherDayMix);
    color = mix(color, atmosphereColorMix, fresnel * atmospherDayMix);



    // color += dayColor;
    // color += specrularColor;
    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}