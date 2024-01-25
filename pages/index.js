import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [isHuman, setIsHuman] = useState(false); // 
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!isHuman) {
      alert("Please confirm that you are a human.");
      return;
    }

    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once the wallet is set, we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm && depositAmount && depositAmount % 10 === 0) {
      let tx = await atm.deposit(depositAmount);
      await tx.wait();
      getBalance();
    } else {
      alert("Deposit amount must be in multiples of 10");
    }
  };

  const withdraw = async () => {
    if (atm && withdrawalAmount && withdrawalAmount % 4 === 0) {
      let tx = await atm.withdraw(withdrawalAmount);
      await tx.wait();
      getBalance();
    } else {
      alert("Withdrawal amount must be in multiples of 4");
    }
  };

  const initUser = () => {
    // Check to see if the user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask to use this ATM.</p>;
    }

    // Check to see if the user is connected. If not, connect to their account
    if (!account) {
      return (
        <div>
          <label>
            <input
              type="checkbox"
              checked={isHuman}
              onChange={() => setIsHuman(!isHuman)}
            />
            Are you a human?
          </label>
          <button onClick={connectAccount}>
            Please connect your Metamask wallet
          </button>
        </div>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div style={{ background: "lightgreen", padding: "10px", borderRadius: "5px" }}>
        <p>Owner: Mouresh</p> {/* Added owner's name */}
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <label>
          Deposit Amount (in multiples of 10):
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
        </label>
        <button onClick={deposit}>Deposit</button>

        <label>
          Withdrawal Amount (in multiples of 4):
          <input
            type="number"
            value={withdrawalAmount}
            onChange={(e) => setWithdrawalAmount(e.target.value)}
          />
        </label>
        <button onClick={withdraw}>Withdraw</button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
