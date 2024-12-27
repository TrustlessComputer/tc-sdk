const dogecore = require('bitcore-lib-doge');

const randomDogeWallet = () => {
    const privateKey = new dogecore.PrivateKey();
    const address = privateKey.toAddress();

    // Step 3: Log the private key, public key, and Dogecoin address
    console.log('Private Key (WIF):', privateKey.toWIF()); // Wallet Import Format (WIF)
    // console.log('Public Key:', publicKey.toString());
    console.log('Dogecoin Address:', address.toString());
}


export {
    randomDogeWallet,
}