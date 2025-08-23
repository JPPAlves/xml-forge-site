// Função auxiliar para atualizar as barras de status do modal
function updateModalStatusBar(text, statusBarElement) {
    const lineCount = text ? text.split('\n').length : 0;
    const sizeInKB = text ? (new Blob([text]).size / 1024).toFixed(2) : 0;
    const statusInfo = statusBarElement.querySelector('.status-info');
    if (statusInfo) {
        statusInfo.innerHTML = `<span>Linhas: ${lineCount}</span><span>Tamanho: ${sizeInKB} KB</span>`;
    }
}

// Função auxiliar para configurar a leitura de arquivos
function setupFileReader(openBtn, fileInput, textArea, statusBar) {
    openBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                textArea.value = content;
                updateModalStatusBar(content, statusBar);
            };
            reader.readAsText(file);
        }
    });
}


export function setupDiffModal(elements) {
    // Abrir/Fechar modal
    elements.diffXmlBtn.addEventListener('click', () => elements.diffModal.style.display = 'flex');
    const closeDiffModal = () => elements.diffModal.style.display = 'none';
    elements.closeDiffModalBtn.addEventListener('click', closeDiffModal);
    window.addEventListener('click', (event) => {
        if (event.target === elements.diffModal) closeDiffModal();
    });

    // Atualização em tempo real das barras de status
    elements.xmlSourceInput.addEventListener('input', () => updateModalStatusBar(elements.xmlSourceInput.value, elements.sourceStatusBar));
    elements.xmlChangedInput.addEventListener('input', () => updateModalStatusBar(elements.xmlChangedInput.value, elements.changedStatusBar));
    
    // Botões "Abrir Arquivo"
    setupFileReader(elements.openFileSourceBtn, elements.openFileSourceInput, elements.xmlSourceInput, elements.sourceStatusBar);
    setupFileReader(elements.openFileChangedBtn, elements.openFileChangedInput, elements.xmlChangedInput, elements.changedStatusBar);

    // Botão "Executar Comparação"
    elements.runDiffBtn.addEventListener('click', () => {
        // Ativa o estado de carregamento
        elements.runDiffBtn.disabled = true;
        elements.runDiffBtn.classList.add('btn-loading');
        elements.runDiffBtn.textContent = 'Comparando...';
        
        // Usamos setTimeout para garantir que o navegador renderize o estado de "loading"
        setTimeout(() => {
            const sourceXml = elements.xmlSourceInput.value;
            const changedXml = elements.xmlChangedInput.value;
            elements.diffOutput.innerHTML = '';
            
            if (typeof JsDiff === 'undefined') {
                elements.diffOutput.textContent = 'Erro: A biblioteca de comparação (diff.min.js) não foi carregada.';
            } else {
                const diff = JsDiff.diffLines(sourceXml, changedXml);
                const fragment = document.createDocumentFragment();
                diff.forEach((part) => {
                    const className = part.added ? 'diff-added' : (part.removed ? 'diff-removed' : 'diff-common');
                    const span = document.createElement('span');
                    span.className = className;
                    span.appendChild(document.createTextNode(part.value));
                    fragment.appendChild(span);
                });
                elements.diffOutput.appendChild(fragment);
            }
            
            // Restaura o botão ao estado normal
            elements.runDiffBtn.disabled = false;
            elements.runDiffBtn.classList.remove('btn-loading');
            elements.runDiffBtn.textContent = 'Executar Comparação';

        }, 50);
    });
}