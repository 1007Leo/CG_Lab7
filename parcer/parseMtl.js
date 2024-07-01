function parseMtl(text) {
    const materials = {};
    let material;

    const keywords = {
        newmtl(parts, unparsedArgs) {
            material = {};
            materials[unparsedArgs] = material;
        },
        /* eslint brace-style:0 */
        Ns(parts)       { material.shininess      = parseFloat(parts[0]); },
        Ka(parts)       { material.ambient        = parts.map(parseFloat); },
        Kd(parts)       { material.diffuse        = parts.map(parseFloat); },
        Ks(parts)       { material.specular       = parts.map(parseFloat); },
        Ke(parts)       { material.emissive       = parts.map(parseFloat); },
        map_Kd(parts, unparsedArgs)   { material.diffuseMap = parseMapArgs(unparsedArgs); },
        map_Ns(parts, unparsedArgs)   { material.specularMap = parseMapArgs(unparsedArgs); },
        map_Bump(parts, unparsedArgs) { material.normalMap = parseMapArgs(unparsedArgs); },
        map_Ka(parts, unparsedArgs)   { material.Ka = parseMapArgs(unparsedArgs); },
        map_d(parts, unparsedArgs)   { material.d = parseMapArgs(unparsedArgs); },
        Ni(parts)       { material.opticalDensity = parseFloat(parts[0]); },
        d(parts)        { material.opacity        = parseFloat(parts[0]); },
        illum(parts)    { material.illum          = parseInt(parts[0]); },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
        const line = lines[lineNo].trim();
        if (line === '' || line.startsWith('#')) {
        continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
        continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
        console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
        continue;
        }
        handler(parts, unparsedArgs);
    }

    return materials;
}

function parseMapArgs(unparsedArgs) {
    // TODO: handle options
    return unparsedArgs;
  }

export {parseMtl}