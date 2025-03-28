// /** @typedef {import('../src/message.ts').DevvitSystemMessage} DevvitSystemMessage */
// /** @typedef {import('../src/message.ts').WebViewMessage} WebViewMessage */
// /* to-do: @import {DevvitSystemMessage, WebViewMessage} from '../src/message.ts' */

class App {
  constructor() {
    //tell the devvit app ready to accept the gene
    addEventListener("message", this.#onMessage);
    addEventListener("load", (event) => {
      postWebViewMessage({ type: "webViewReady" }, "*");
    });
  }
  /**
   * @arg {MessageEvent<DevvitSystemMessage>} ev
   * @return {void}
   */
  #onMessage = (ev) => {
    console.log(ev.data.data);
    const gene = ev.data.data.message.gene;
    import("./geneDecoder.min.js").then(({ renderCreature }) => {
      const base64img = renderCreature(gene);
      postWebViewMessage({ type: "imgURL", url: base64img });
    });
  };
}
/**
 * Sends a message to the Devvit app.
 * @arg {WebViewMessage} msg
 * @return {void}
 */
function postWebViewMessage(msg) {
  parent.postMessage(msg, "*");
}

new App();
