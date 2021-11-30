import React from "react";
import Select from 'react-select';
import { useEffect, useState } from "react";
import {
  connectWallet,
  loadChairperson,
  getCurrentWalletConnected,
  vote,
  addPerson,
  votingContract,
  determineWinner,
  loadOptions
} from "./util/interact.js";

import alchemylogo from "./alchemylogo.svg";

const HelloWorld = () => {
  //state variables
  const [options, setOptions] = useState([]);
  const [winner, setWinner] = useState("");
  const [showVoteDropdown, setShowVoteDropdown] = useState(false); 
  const [showWinner, setShowWinner] = useState(false); 
  const [voteChoice, setVoteChoice] = useState(""); 
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [chairperson, setChairperson] = useState(""); //default message
  const [newMessage, setNewMessage] = useState("");

  //called only once
  useEffect(async () => {
    const cp = await loadChairperson();
    setChairperson(cp);

    const o = await loadOptions();
    console.log("Options are: " + o);
    const refinedOptions = o.map((name) => { 
      return {value: name, label: name}}
    );
    setOptions(refinedOptions);

    addSmartContractListener();

    const {address, status} = await getCurrentWalletConnected();
    setWallet(address);
    setStatus(status);

    addWalletListener();

  }, []);


  function addSmartContractListener() {


    votingContract.events.PersonAdded({}, (error, data) => {
      console.log("Person was added");
      if (error) {
        setStatus("😥 " + error.message);
      } else {
        const refinedOptions = data.returnValues[0].map((name) => { 
          return {value: name, label: name}}
        );

        console.log("Refined Options: " + refinedOptions);

        setOptions(refinedOptions);
      }
    });

    // votingContract.events.VoteComplete({}, (error, data) => {
    //   console.log("The vote was completed!");
    //   if (error) {
    //     setStatus("😥 " + error.message);
    //   } else {
    //     const winnerName = data.returnValues[0];
    //     setWinner(winnerName);
    //     setShowWinner(true);
    //   }
    // });
    
  }

  function addWalletListener() {
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        setWallet(accounts[0]);
      } else {
        setWallet("");
        setStatus("🦊 Connect to Metamask using the top right button.");
      }
    });
  } else {
    setStatus(
      <p>
        {" "}
        🦊{" "}
        <a target="_blank" href={`https://metamask.io/download.html`}>
          You must install Metamask, a virtual Ethereum wallet, in your
          browser.
        </a>
      </p>
    );
  }
}

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const onRegisterPressed = async () => {
    //remove this and set show vote dropdown when 
    setShowVoteDropdown(true);
    const { status } = await addPerson(walletAddress, newMessage);
    setStatus(status);
  };

  const onVotePressed = async () => {
    await vote(walletAddress, voteChoice);
  };
  const onDetermineWinner = async () => {
    const winnerName = await determineWinner(walletAddress);
    setWinner(winnerName);
    setShowWinner(true);
  };


  //the UI of our component
  return (
    <div id="container">

      <div id="header" style={{ height: "70px" }}>
        <img id="logo" src={alchemylogo}></img>
        <button id="walletButton" onClick={connectWalletPressed}>
          {walletAddress.length > 0 ? (
            "Connected: " +
            String(walletAddress).substring(0, 6) +
            "..." +
            String(walletAddress).substring(38)
          ) : (
            <span>Connect Wallet</span>
          )}
        </button>
      </div>

      <div id='meat'>
            <div id="registration">
                <input
                  type="text"
                  placeholder="Please enter your name here"
                  onChange={(e) => setNewMessage(e.target.value)}
                  value={newMessage}
                />
                <p id="status">{status}</p>
                <div id="buttons" style={{ marginTop: "0px" }}>
                  <button id="register" onClick={onRegisterPressed} style={{ marginTop: "0px" }} >
                    Register
                  </button>
                  
                </div>
            </div>
            <div id="voting">
              { showVoteDropdown && (
                <div style={{ paddingTop: "20px" }}>

                  <Select options={options} onChange={(e) => setVoteChoice(e.value)}/>

                  <button id="vote" onClick={onVotePressed} style={{ marginTop: "20px" }}>
                    Vote
                  </button>

                  <button id="determineWinner" onClick={onDetermineWinner} style={{ marginTop: "0px", marginLeft: "20px" }}>
                    Tally Votes!
                  </button>

                  
                </div>
              )}
              { showWinner && (
                <div>
                  <h2>The winner is: {winner}</h2>
                </div>
              )}

            </div>

      </div>

      
    </div>
  );
};

export default HelloWorld;
