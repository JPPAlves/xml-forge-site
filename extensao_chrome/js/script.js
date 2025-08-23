// --- IMPORTAÇÕES DOS MÓDULOS ---
import { historyManager } from './modules/historyManager.js';
import { formatXml, highlightSyntax } from './modules/formatter.js';
import { convertXmlToJson } from './modules/xmlToJson.js';
import { convertJsonToXml } from './modules/jsonToXml.js';
import { setupDownloadButton } from './modules/download.js';
import { setupDiffModal } from './modules/diffManager.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // --- REFERÊNCIAS AOS ELEMENTOS DO DOM ---
    // Elementos principais da UI
    const xmlInput = document.getElementById('xmlInput');
    const outputContainer = document.querySelector('.output-container');
    const output = document.getElementById('output');
    const themeToggle = document.getElementById('themeToggle');
    const historyList = document.getElementById('historyList');

    // Barras de Status
    const inputStatusBar = document.getElementById('inputStatusBar');
    const statusBar = document.getElementById('statusBar');
    
    // Botões da Toolbar Principal
    const formatXmlBtn = document.getElementById('formatXml');
    const xmlToJsonBtn = document.getElementById('xmlToJson');
    const jsonToXmlBtn = document.getElementById('jsonToXml');
    
    // Botões de Ação do Editor
    const openFileBtn = document.getElementById('openFileBtn');
    const openFileInput = document.getElementById('openFile');
    const clearBtn = document.getElementById('clearBtn');
    
    // Botões de Ação do Resultado
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // Elementos do Modal de Comparação (Diff)
    const diffXmlBtn = document.getElementById('diffXml');
    const diffModal = document.getElementById('diffModal');
    const closeDiffModalBtn = document.getElementById('closeDiffModal');
    const runDiffBtn = document.getElementById('runDiffBtn');
    const xmlSourceInput = document.getElementById('xmlSource');
    const xmlChangedInput = document.getElementById('xmlChanged');
    const diffOutput = document.getElementById('diffOutput');
    const sourceStatusBar = document.getElementById('sourceStatusBar');
    const changedStatusBar = document.getElementById('changedStatusBar');
    const openFileSourceBtn = document.getElementById('openFileSourceBtn');
    const openFileSourceInput = document.getElementById('openFileSourceInput');
    const openFileChangedBtn = document.getElementById('openFileChangedBtn');
    const openFileChangedInput = document.getElementById('openFileChangedInput');

    // Elementos do Modal de Validação (XSD)
    const validateXsdBtn = document.getElementById('validateXsd');
    const xsdModal = document.getElementById('xsdModal');
    const closeXsdModalBtn = document.getElementById('closeXsdModal');
    const runXsdValidationBtn = document.getElementById('runXsdValidationBtn');
    const xsdInput = document.getElementById('xsdInput');
    const xsdOutput = document.getElementById('xsdOutput');
    const xsdStatusBar = document.getElementById('xsdStatusBar');
    const openFileXsdBtn = document.getElementById('openFileXsdBtn');
    const openFileXsdInput = document.getElementById('openFileXsdInput');


    // --- INICIALIZAÇÃO DOS MÓDULOS ---
    setupDownloadButton(downloadBtn, output);
    setupDiffModal({
        diffXmlBtn,
        diffModal,
        closeDiffModalBtn,
        runDiffBtn,
        xmlSourceInput,
        xmlChangedInput,
        diffOutput,
        sourceStatusBar,
        changedStatusBar,
        openFileSourceBtn,
        openFileSourceInput,
        openFileChangedBtn,
        openFileChangedInput
    });

    // --- FUNÇÕES AUXILIARES DE UI ---
    function displayError(message) {
        clearErrorMessages();
        const errorBox = document.createElement('div');
        errorBox.className = 'error-message';
        errorBox.textContent = message;
        outputContainer.insertBefore(errorBox, output);
    }
    function clearErrorMessages() {
        const existingError = outputContainer.querySelector('.error-message');
        if (existingError) existingError.remove();
    }
    const updateOutputStatusBar = (text) => {
        const lineCount = text ? text.split('\n').length : 0;
        const sizeInKB = text ? (new Blob([text]).size / 1024).toFixed(2) : 0;
        const statusInfo = statusBar.querySelector('.status-info');
        if (statusInfo) {
            statusInfo.innerHTML = `<span>Linhas: ${lineCount}</span><span>Tamanho: ${sizeInKB} KB</span>`;
        }
    };
    const updateInputStatusBar = (text) => {
        const lineCount = text ? text.split('\n').length : 0;
        const sizeInKB = text ? (new Blob([text]).size / 1024).toFixed(2) : 0;
        const statusInfo = inputStatusBar.querySelector('.status-info');
        if (statusInfo) {
            statusInfo.innerHTML = `<span>Linhas: ${lineCount}</span><span>Tamanho: ${sizeInKB} KB</span>`;
        }
    };
    
    // Função para atualizar a barra de status do modal XSD
    const updateXsdStatusBar = (text) => {
        const lineCount = text ? text.split('\n').length : 0;
        const sizeInKB = text ? (new Blob([text]).size / 1024).toFixed(2) : 0;
        const statusInfo = xsdStatusBar.querySelector('.status-info');
        if (statusInfo) {
            statusInfo.innerHTML = `<span>Linhas: ${lineCount}</span><span>Tamanho: ${sizeInKB} KB</span>`;
        }
    };

    // --- LÓGICA DE ATUALIZAÇÃO E MODO ESCURO ---
    xmlInput.addEventListener('input', () => {
        updateInputStatusBar(xmlInput.value);
    });
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        chrome.storage.local.set({ theme: isDarkMode ? 'dark' : 'light' });
    });
    chrome.storage.local.get('theme', (data) => {
        if (data.theme === 'dark') {
            document.body.classList.add('dark-mode');
        }
    });

    // --- EVENTOS DOS BOTÕES PRINCIPAIS ---
     formatXmlBtn.addEventListener('click', async () => {
        const rawXml = xmlInput.value;
        clearErrorMessages();
        if (!rawXml.trim()) {
            output.innerHTML = '';
            updateOutputStatusBar('');
            return;
        }
        const result = formatXml(rawXml);
        output.innerHTML = highlightSyntax(result.formattedXml);
        updateOutputStatusBar(result.formattedXml);
        
        await historyManager.addToHistory(rawXml);
        renderHistory();

        if (result.error) displayError(result.error.message);
    });
    xmlToJsonBtn.addEventListener('click', async () => {
        const rawXml = xmlInput.value;
        clearErrorMessages();
        if (!rawXml.trim()) {
            displayError("O campo de entrada está vazio. Por favor, insira um XML.");
            return;
        }
        try {
            const jsonResult = convertXmlToJson(rawXml);
            output.textContent = jsonResult;
            updateOutputStatusBar(jsonResult);
            await historyManager.addToHistory(rawXml);
            renderHistory();
        } catch (error) {
            displayError(error.message);
        }
    });
    jsonToXmlBtn.addEventListener('click', async () => {
        const jsonInput = xmlInput.value;
        clearErrorMessages();
        if (!jsonInput.trim()) {
            displayError("O campo de entrada está vazio. Por favor, insira um JSON.");
            return;
        }
        try {
            const xmlResult = convertJsonToXml(jsonInput);
            const result = formatXml(xmlResult);
            output.innerHTML = highlightSyntax(result.formattedXml);
            updateOutputStatusBar(result.formattedXml);
            await historyManager.addToHistory(jsonInput);
            renderHistory();
            if (result.error) displayError(result.error.message);
        } catch (error) {
            displayError(error.message);
        }
    });

    // --- EVENTOS DOS BOTÕES DE AÇÃO ---
    openFileBtn.addEventListener('click', () => openFileInput.click());
    openFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = e.target.result;
                xmlInput.value = content;
                await historyManager.addToHistory(content);
                renderHistory();
                updateInputStatusBar(content);
            };
            reader.readAsText(file);
        }
    });
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(output.innerText)
            .then(() => {
                const originalText = copyBtn.querySelector('span').innerText;
                copyBtn.querySelector('span').innerText = 'Copiado!';
                setTimeout(() => { copyBtn.querySelector('span').innerText = originalText; }, 2000);
            })
            .catch(() => displayError('Falha ao copiar.'));
    });
    clearBtn.addEventListener('click', () => {
        xmlInput.value = '';
        output.innerHTML = '';
        updateInputStatusBar('');
        updateOutputStatusBar('');
        clearErrorMessages();
    });

    // --- LÓGICA DE HISTÓRICO ---
    const renderHistory = async () => {
        const history = await historyManager.getHistory();
        historyList.innerHTML = '';
        history.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.substring(0, 50) + (item.length > 50 ? '...' : '');
            li.title = item;
            li.addEventListener('click', () => { 
                xmlInput.value = item;
                updateInputStatusBar(item);
             });
            historyList.appendChild(li);
        });
    };
    
    // --- LÓGICA DO MODAL DE VALIDAÇÃO (XSD) ---
    validateXsdBtn.addEventListener('click', () => {
        if (!xmlInput.value.trim()) {
            displayError("Primeiro, insira na tela principal o XML que você deseja validar.");
            return;
        }
        xsdOutput.innerHTML = '';
        xsdModal.style.display = 'flex';
    });
    const closeXsdModal = () => {
        xsdModal.style.display = 'none';
    };
    closeXsdModalBtn.addEventListener('click', closeXsdModal);

    runXsdValidationBtn.addEventListener('click', async () => {
        const xmlContent = xmlInput.value;
        const xsdContent = xsdInput.value;

        if (!xsdContent.trim()) {
            xsdOutput.className = 'validation-error';
            xsdOutput.textContent = 'Erro: O esquema XSD não pode estar vazio.';
            return;
        }

        runXsdValidationBtn.disabled = true;
        runXsdValidationBtn.classList.add('btn-loading');
        xsdOutput.className = '';
        xsdOutput.textContent = 'Validando...';

        try {
            const xsdValidator = await libxmlxsd({
                locateFile: (file) => `js/libs/${file}`
            });
            const validationResult = xsdValidator.validate(xsdContent, xmlContent);
            if (validationResult === null) {
                xsdOutput.className = 'validation-success';
                xsdOutput.textContent = '🎉 Sucesso! O XML é válido de acordo com o esquema XSD.';
            } else {
                xsdOutput.className = 'validation-error';
                const errorMessages = validationResult.map(err => `- Linha ${err.line}: ${err.message.trim()}`).join('\n');
                xsdOutput.textContent = '❌ Erros de Validação:\n' + errorMessages;
            }
            xsdValidator.delete();
        } catch (error) {
            xsdOutput.className = 'validation-error';
            xsdOutput.textContent = `Ocorreu um erro crítico durante a validação.\nDetalhes: ${error.message}`;
        } finally {
            runXsdValidationBtn.disabled = false;
            runXsdValidationBtn.classList.remove('btn-loading');
            runXsdValidationBtn.textContent = 'Validar XML';
        }
    });

    // Eventos para o novo botão "Abrir" e a barra de status do modal XSD
  xsdInput.addEventListener('input', () => {
    updateXsdStatusBar(xsdInput.value);
});

openFileXsdBtn.addEventListener('click', () => openFileXsdInput.click());
    
    openFileXsdInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                xsdInput.value = content;
                updateXsdStatusBar(content);
            };
            reader.readAsText(file);
        }
    });


    // --- LÓGICA DE FECHAMENTO DOS MODAIS ---
    window.addEventListener('click', (event) => {
        if (event.target === xsdModal) closeXsdModal();
    });

    // --- INICIALIZAÇÃO ---
    renderHistory();
});