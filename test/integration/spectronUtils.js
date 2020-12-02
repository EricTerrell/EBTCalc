module.exports = class SpectronUtils {
    constructor(client) {
        this._client = client;
    }
    async getElement(selector) {
        return await this._client.$(selector);
    }

    async click(selector) {
        const element = await this.getElement(selector);

        await element.click();
    }

    async getText(selector) {
        const element = await this.getElement(selector);

        return await element.getText();
    }

    async getValue(selector) {
        const element = await this.getElement(selector);

        return await element.getValue();
    }

};
