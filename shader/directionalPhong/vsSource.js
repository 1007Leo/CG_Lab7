const vsSource = 
    `  #version 300 es
        precision mediump float;

        in vec3 a_VertexPosition;
        in vec3 a_VertexNormal;
        in vec2 a_TextureCoord;

        uniform mat4 uProjectionMatrix;
        uniform mat4 uModelViewMatrix;
        uniform mat3 uNormalMatrix;
        uniform vec3 uLightDirection;

        out vec3 vNormal;
        out vec2 vTextureCoord;
        out vec3 vLightDir;
        out vec3 vPosition;

        void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(a_VertexPosition, 1.0);
            
            vNormal = normalize(uNormalMatrix * a_VertexNormal);
            vTextureCoord = a_TextureCoord;
            vLightDir = normalize(uLightDirection);
            vPosition = vec3(uModelViewMatrix * vec4(a_VertexPosition, 1.0));
        }
    `;

export {vsSource};