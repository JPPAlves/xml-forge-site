// Função privada que cria e dispara o download
function downloadFile(content, type, filename) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Função exportada que configura o botão de download inteligente
function setupDownloadButton(downloadBtn, outputElement) {
    downloadBtn.addEventListener('click', () => {
        const content = outputElement.innerText;
        if (!content.trim()) {
            // Se não houver conteúdo, não faz nada
            return;
        }

        const trimmedContent = content.trim();

        // LÓGICA DE DETECÇÃO
        if (trimmedContent.startsWith('<')) {
            // Se começa com '<', assume que é XML
            downloadFile(content, 'application/xml', 'resultado.xml');
        } else if (trimmedContent.startsWith('{') || trimmedContent.startsWith('[')) {
            // Se começa com '{' ou '[', assume que é JSON
            downloadFile(content, 'application/json', 'resultado.json');
        } else {
            // Caso contrário, baixa como texto simples
            downloadFile(content, 'text/plain', 'resultado.txt');
        }
    });
}

export { setupDownloadButton };