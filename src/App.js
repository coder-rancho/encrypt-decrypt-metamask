import {useState, useEffect} from "react";
// import { ethUtil } from "ethereumjs-util";
// import { sigUtil } from "@metamask/eth-sig-util";
import { encrypt } from "@metamask/eth-sig-util";

const UTF8_ENCRYPTION_VERSION = 'x25519-xsalsa20-poly1305'

function App() {

  /* useEffects */
  useEffect(() => {
    if (window.ethereum !== undefined) {
      setWallet(window.ethereum);
    } else {
      alert("Metamask not detected!!");
    }
  }, [])

  /* useStates initialization */
  const [wallet, setWallet] = useState();
  const [publicKey, setPublicKey] = useState();
  const [account, setAccount] = useState();
  const [messageStatus, setMessageStatus] = useState("Message");
  const [message, setMessage] = useState("Your Message will appear here!!")


  /* Functions */

  async function connect() {
    try {
      if (!wallet.isMetaMask) {
        alert("This website only supports Metamask, please install it!!");
        return;
      }
  
      const accounts = await wallet.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      console.log(`Connected to ${account}`);
      document.getElementById("step1").style.display = "none";
    } catch (err) {
      alert(err.message);
    }
  }

  async function getPublicKey() {
    try {
      
      /** @param pubKey Base64 */
      let keyB64 = await wallet.request({
        method: "eth_getEncryptionPublicKey",
        params: [account],
      });
      let pubKey = Buffer.from(keyB64, 'base64');
      setPublicKey(pubKey);
      console.log(`Public Key: ${pubKey}`)
      console.log(`Public Key: ${publicKey}`)
    } catch (err) {
      alert(err.message);
    }
  }

  /**
   * 
   * @param {Buffer:Base64} publicKey 
   * @param {Buffer:utf8} data 
   * @returns {object of Buffer:Base64} encryptedData
   */
  function encryptData(publicKey, data) {

    /**
     * @notice It only supports utf-8 encryption, hence data should be passed as string only.
     */
    return encrypt({
      publicKey: publicKey.toString('base64'),
      //// data: ascii85.encode(data).toString(),
      data: data.toString(),
      version: UTF8_ENCRYPTION_VERSION,
    });
  }

  async function encryptMessage() {
    if (!account) {
        alert("Connect to the MetaMask first!!");
        return;
    }
    
    if (!publicKey) getPublicKey()
    
    if (!publicKey) return;

    let data = document.getElementById("messageInput").value;

    let encryptedDataObj = encryptData(publicKey, Buffer.from(data, "utf-8"))

    console.log(encryptedDataObj)

    setMessageStatus("Encrypted.");
    setMessage(encryptMessage);

  }

  async function decryptMessage() {
    if (!account) {
      alert("Connect to the MetaMask first!!");
      return;
    }

    let messageText = await wallet.request({
      method: "eth_decrypt",
      params: [message, account]
    })

    setMessageStatus("Decrypted")
    setMessage(messageText)
  }

  return (
    <div className="App">
      <h1>Encrypt/Decrypt Data</h1>

      <div id="step1">
          <h2>Step 1: Connect to the MetaMask.</h2>
          <button onClick={connect} >Connect</button>
      </div>

      <form action="">
          <div>
              <label for="messageInput">messageInput</label>
              <input type="text" id="messageInput" aria-describedby="messageInputDescription"></input>
              <div id="messageInputDescription">Enter your messageInput to be encrypted.</div>
          </div>
          <div>
              <button onClick={encryptMessage} aria-describedby="submitBtnDescp">Encrypt</button>
              <div id="submitBtnDescp">Metamask will pop-up twice for permission.</div>
          </div>
      </form>

      <div >
          <p>{messageStatus}</p>
          <p>{message}</p>
          <button onClick={decryptMessage}>Decrypt</button>
      </div>
    </div>
  );
}

export default App;
