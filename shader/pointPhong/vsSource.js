const vsSource = 
    `  #version 300 es
        precision mediump float;
        
        in vec3 a_VertexPosition;
        in vec3 a_VertexNormal;
        in vec2 a_TextureCoord;

        uniform mat4 uProjectionMatrix;
        uniform mat4 uModelViewMatrix;
        uniform mat3 uNormalMatrix;

        out vec3 vNormal;
        out mat3 uNormal;
        out vec3 vertPos;
        out vec2 textureCoord;
        
        void main(){
            vec4 vertPos4 = uModelViewMatrix * vec4(a_VertexPosition, 1.0);
            vertPos = vec3(vertPos4) / vertPos4.w;

            vNormal = a_VertexNormal;
            uNormal = uNormalMatrix;

            gl_Position = uProjectionMatrix * vertPos4;
            textureCoord = a_TextureCoord;
        }
    `;

export {vsSource};