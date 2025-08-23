function convertXmlToJson(xml) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");

        const parseError = xmlDoc.getElementsByTagName("parsererror");
        if (parseError.length > 0) {
            const errorText = parseError[0].innerText || parseError[0].textContent;
            throw new Error(errorText.replace("This page contains the following errors:", "").trim());
        }

        function xmlNodeToJson(node) {
            if (node.nodeType === 3) {
                return node.nodeValue.trim();
            }

            if (node.nodeType === 1 && node.childNodes.length === 1 && node.childNodes[0].nodeType === 3) {
                return node.childNodes[0].nodeValue.trim();
            }
            
            let obj = {};
            
            // Atributos
            if (node.attributes && node.attributes.length > 0) {
                obj["@attributes"] = {};
                for (let j = 0; j < node.attributes.length; j++) {
                    const attribute = node.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }

            // Nós filhos
            for (let i = 0; i < node.childNodes.length; i++) {
                const item = node.childNodes.item(i);
                const nodeName = item.nodeName;

                // Ignora nós de texto vazios
                if (item.nodeType === 3 && !item.nodeValue.trim()) {
                    continue;
                }

                if (typeof obj[nodeName] === "undefined") {
                    obj[nodeName] = xmlNodeToJson(item);
                } else {
                    if (typeof obj[nodeName].push === "undefined") {
                        const old = obj[nodeName];
                        obj[nodeName] = [old];
                    }
                    obj[nodeName].push(xmlNodeToJson(item));
                }
            }
            return obj;
        }

        const result = xmlNodeToJson(xmlDoc.documentElement);
        return JSON.stringify({ [xmlDoc.documentElement.nodeName]: result }, null, 4);

    } catch (e) {
        throw new Error(`Erro ao converter XML para JSON: ${e.message}`);
    }
}

export { convertXmlToJson };