function formatXml(xml) {
    try {
        xml = xml.trim();
        const declarationMatch = xml.match(/^<\?xml[^>]*\?>\s*/i);
        const xmlDeclaration = declarationMatch ? declarationMatch[0] : "";
        const xmlContent = xml.substring(xmlDeclaration.length);

        if (!xmlContent.trim()) {
            if (xmlDeclaration) return { formattedXml: xmlDeclaration.trim(), error: null };
            throw new Error("Documento XML inválido ou incompleto. Nenhuma tag raiz foi encontrada.");
        }

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, "application/xml");

        const parseError = xmlDoc.getElementsByTagName("parsererror");
        if (parseError.length > 0) {
            const errorElement = parseError[0];
            const errorText = errorElement.innerText || errorElement.textContent;
            const lineMatch = errorText.match(/line number (\d+)/) || errorText.match(/linha (\d+)/);
            const lineNumber = lineMatch ? parseInt(lineMatch[1], 10) : null;
            return {
                formattedXml: xml,
                error: {
                    message: errorText.replace("This page contains the following errors:", "").trim(),
                    line: lineNumber
                }
            };
        }
        
        function processNode(node, indentation) {
            let xmlString = "";
            const indent = "\t".repeat(indentation);

            if (node.nodeType === 1) { // Element
                const attributes = Array.from(node.attributes).map(attr => `${attr.name}="${attr.value}"`).join(' ');
                xmlString += `${indent}<${node.nodeName}${attributes ? ' ' + attributes : ''}`;
                if (node.childNodes.length === 0) {
                    xmlString += "/>\n";
                } else if (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3 && node.childNodes[0].nodeValue.trim() !== '') {
                    xmlString += `>${node.childNodes[0].nodeValue.trim()}</${node.nodeName}>\n`;
                } else {
                    xmlString += ">\n";
                    node.childNodes.forEach(child => {
                        xmlString += processNode(child, indentation + 1);
                    });
                    xmlString += `${indent}</${node.nodeName}>\n`;
                }
            } else if (node.nodeType === 8) { 
                xmlString += `${indent}\n`;
            } else if (node.nodeType === 4) { // CDATA
                xmlString += `${indent}<![CDATA[${node.nodeValue}]]>\n`;
            }
            return xmlString;
        }

        const formattedContent = processNode(xmlDoc.documentElement, 0).trim();
        return { formattedXml: (xmlDeclaration + formattedContent), error: null };

    } catch (e) {
        return { formattedXml: xml, error: { message: e.message, line: null } };
    }
}

function highlightSyntax(xml) {
    let escapedXml = xml
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    return escapedXml
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="syntax-comment">$1</span>')
        .replace(/(&lt;\?xml.*?\?&gt;)/g, '<span class="syntax-comment">$1</span>')
        .replace(/([a-zA-Z0-9_:-]+)=(".*?")/g, '<span class="syntax-attribute">$1</span>=<span class="syntax-string">$2</span>')
        .replace(/(&lt;\/?)([a-zA-Z0-9_:-]+)/g, '$1<span class="syntax-tag">$2</span>')
        .replace(/(&gt;|\/&gt;)/g, '<span class="syntax-tag">$1</span>')
        .replace(/(&gt;)([^&lt;]+?)(&lt;)/g, '$1<span class="syntax-text">$2</span>$3');
}

export { formatXml, highlightSyntax };