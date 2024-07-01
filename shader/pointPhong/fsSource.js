const fsSource =
    `  #version 300 es
        precision mediump float;

        in vec3 vNormal;
        in mat3 uNormal;
        in vec3 vertPos;
        in vec2 textureCoord;

        uniform vec3 uLightPosition;
        uniform vec3 uAmbientLightColor;
        uniform vec3 uDiffuseLightColor;
        uniform vec3 uSpecularLightColor;

        uniform float uShininess;
        uniform float uAmbientStrength;
        uniform float uSpecularStrength;

        uniform float uConstAtt;
        uniform float uLinAtt;
        uniform float uQAtt;

        uniform sampler2D uTexture;

        out vec4 color;

        void main() {
            //float height = -texture(uTexture, textureCoord * 1.0).r * 2.0;
            //vec3 Normal = normalize(uNormal * (vNormal + vec3(dFdx(height), dFdy(height), 0.0)));
            
            vec3 Normal = normalize(uNormal * vNormal);

            vec3 Light = normalize(uLightPosition - vertPos);

            // Lambert's cosine law
            float lambertian = max(dot(Normal, Light), 0.0);
            float specular = 0.0;
            if(lambertian > 0.0) {
                float specAngle;
                vec3 Viewer = normalize(-vertPos);      // Vector to viewer
                vec3 Refl = reflect(-Light, Normal);    // Reflected light vector
                // Compute the specular term
                specAngle = max(dot(Refl, Viewer), 0.0);
                specular = pow(specAngle, uShininess);
            }

            color = vec4(
                uAmbientStrength * uAmbientLightColor + 
                lambertian * uDiffuseLightColor + 
                specular * uSpecularStrength * uSpecularLightColor, 1.0);

            // Attenuation
            float vertLightDist = distance(vertPos, uLightPosition);
            float attenuation = 1.0 / (uConstAtt + uLinAtt * vertLightDist + uQAtt * vertLightDist * vertLightDist);

            vec4 pixel = texture(uTexture, textureCoord);
            //color = vec4(color.rgb * vec3(232./255., 87./255., 35./255.) * attenuation, color.a);
            color = vec4(color.rgb * pixel.rgb * attenuation, max(color.a, pixel.a));
        }
    `;

export {fsSource};