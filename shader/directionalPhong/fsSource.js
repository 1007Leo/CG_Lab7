const fsSource =
    `  #version 300 es
        precision mediump float;
        
        in vec3 vNormal;
        in vec2 vTextureCoord;
        in vec3 vLightDir;
        in vec3 vPosition;

        uniform vec3 uAmbientLightColor;
        uniform vec3 uDiffuseLightColor;
        uniform vec3 uSpecularLightColor;

        uniform sampler2D uTexture;

        out vec4 color;

        void main() {
            vec3 normal = normalize(vNormal);
            vec3 lightDir = normalize(vLightDir);
            vec3 viewDir = normalize(-vPosition);
            vec3 reflectDir = reflect(-lightDir, normal);
            
            float diffuseFactor = max(dot(normal, lightDir), 0.0);
            vec3 diffuseColor = uDiffuseLightColor * diffuseFactor;
            
            float specularFactor = pow(max(dot(reflectDir, viewDir), 0.0), 70.0); // Shininess factor
            vec3 specularColor = uSpecularLightColor * specularFactor;
            
            vec3 finalColor = uAmbientLightColor + diffuseColor + specularColor;
            
            vec4 textureColor = texture (uTexture, vTextureCoord);
            finalColor *= textureColor.rgb;
            
            color = vec4(finalColor, textureColor.a);
        }
    `;

export {fsSource};