const MAX_HISTORY = 10;

export const historyManager = {
    /**
     * Obtém a lista de histórico do armazenamento da extensão.
     * @returns {Promise<string[]>} Uma promessa que resolve para o array de histórico.
     */
    async getHistory() {
        const data = await chrome.storage.local.get('xmlHistory');
        return data.xmlHistory || [];
    },

    /**
     * Adiciona um novo conteúdo ao histórico.
     * @param {string} content - O conteúdo XML a ser adicionado.
     */
    async addToHistory(content) {
        if (!content || content.trim() === '') {
            return;
        }

        let history = await this.getHistory();
        history = history.filter(item => item !== content);
        history.unshift(content);
        if (history.length > MAX_HISTORY) {
            history.pop();
        }

        await chrome.storage.local.set({ xmlHistory: history });
    }
};