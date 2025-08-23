function convertJsonToXml(jsonString) {
    try {
        const json = JSON.parse(jsonString);
        
        let xml = '';

        function jsonToXmlRecursive(obj, tagName) {
            let attributes = '';
            let children = '';

            // Se o objeto não for um objeto 
            if (typeof obj !== 'object' || obj === null) {
                return `<${tagName}>${obj}</${tagName}>`;
            }

            if (obj['@attributes']) {
                for (const key in obj['@attributes']) {
                    attributes += ` ${key}="${obj['@attributes'][key]}"`;
                }
                delete obj['@attributes']; 
            }
            
            for (const key in obj) {
                const child = obj[key];
                if (Array.isArray(child)) {
                    child.forEach(item => {
                    
                        if (typeof item === 'object') {
                            children += jsonToXmlRecursive(item, key);
                        } else {
                            children += `<${key}>${item}</${key}>`;
                        }
                    });
                } else if (typeof child === 'object' && child !== null) {
                    children += jsonToXmlRecursive(child, key);
                } else {
                 
                    if(key === '#text') {
                        children += child;
                    } else {
                        children += `<${key}>${child}</${key}>`;
                    }
                }
            }
            
            return `<${tagName}${attributes}>${children}</${tagName}>`;
        }

        const rootTag = Object.keys(json)[0];
        xml = jsonToXmlRecursive(json[rootTag], rootTag);
        
        return `<?xml version="1.0" encoding="UTF-8"?>\n` + xml;

    } catch (e) {
        throw new Error(`Erro ao converter JSON para XML: ${e.message}. Verifique se o JSON é válido.`);
    }
}

export { convertJsonToXml };