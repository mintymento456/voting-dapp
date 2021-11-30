require('dotenv').config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

const contractABI = require("../contract-abi.json");
const contractAddress = "0x0E6b9b5CE0D05bd0bEa7114699d6233CE487A9cA";

const votingContractABI = require("../voting-contract-abi.json");
const votingContractAddress = "0x3eC6a2702bCC1324C7169dFC4D38249589Be1Fe8";

export const helloWorldContract = new web3.eth.Contract(
    contractABI,
    contractAddress
  );

export const votingContract = new web3.eth.Contract(
    votingContractABI,
    votingContractAddress
);

export const loadChairperson = async () => { 
    const cp = await votingContract.methods.chairperson().call(); 
    return cp;
};

export const loadOptions = async () => { 
  const o = await votingContract.methods.getPeopleNames().call(); 
  return o;
};


export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
      try {
        const addressArray = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (addressArray.length > 0) {
          return {
            address: addressArray[0],
          };
        } else {
          return {
            address: "",
            status: "🦊 Connect to Metamask using the top right button.",
          };
        }
      } catch (err) {
        return {
          address: "",
          status: "😥 " + err.message,
        };
      }
    } else {
      return {
        address: "",
        status: (
          <span>
            <p>
              {" "}
              🦊{" "}
              <a target="_blank" href={`https://metamask.io/download.html`}>
                You must install Metamask, a virtual Ethereum wallet, in your
                browser.
              </a>
            </p>
          </span>
        ),
      };
    }
  };

export const vote = async (address, name) => {
    console.log("vote called!");
    //input error handling
    if (!window.ethereum || address === null) {
      return {
      status:
          "💡 Connect your Metamask wallet to update the message on the blockchain.",
      };
    }

    if (name.trim() === "") {
        return {
        status: "❌ You must select a candidate to vote for",
        };
    }

    //set up transaction parameters
    const transactionParameters = {
      to: votingContractAddress, // Required except during contract publications.
      from: address, // must match user's active address.
      data: votingContract.methods.vote(name).encodeABI(),
    };

    //sign the transaction
    try {
      const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
      });
      return {
        status: (
            <span>
            ✅{" "}
            <a target="_blank" href={`https://ropsten.etherscan.io/tx/${txHash}`}>
                View the status of your transaction on Etherscan!
            </a>
            </span>
        ),
      };
    } catch (error) {
        return {
        status: "😥 " + error.message,
        };
    }



};

export const addPerson = async (address, name) => {
    console.log("addPerson called!");
    //input error handling
    if (!window.ethereum || address === null) {
      return {
      status:
          "💡 Connect your Metamask wallet to update the message on the blockchain.",
      };
    }

    if (name.trim() === "") {
        return {
        status: "❌ Your message cannot be an empty string.",
        };
    }

    //set up transaction parameters
    const transactionParameters = {
      to: votingContractAddress, // Required except during contract publications.
      from: address, // must match user's active address.
      data: votingContract.methods.addPerson(name).encodeABI(),
    };

    //sign the transaction
    try {
      const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
      });
      return {
        status: (
            <span>
            ✅{" "}
            <a target="_blank" href={`https://ropsten.etherscan.io/tx/${txHash}`}>
                View the status of your transaction on Etherscan!
            </a>
            </span>
        ),
      };
    } catch (error) {
        return {
        status: "😥 " + error.message,
        };
    }

};

export const determineWinner = async (address) => {
    console.log("determineWinner called!");

    if (!window.ethereum || address === null) {
      return {
      status:
          "💡 Connect your Metamask wallet to update the message on the blockchain.",
      };
    }

    const winner = await votingContract.methods.determineWinner().call(); 
   
    console.log("winner is: " + winner);
    return winner;

};
