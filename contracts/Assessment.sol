// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    uint256 public gstRate = 10; // GST rate is set to 10% for demonstration

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event GSTAdded(uint256 gstAmount);
    event GSTRateChanged(uint256 newGSTRate);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint256 _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function addGST(uint256 _amount) public returns (uint256) {
        // Calculate GST amount
        uint256 gstAmount = (_amount * gstRate) / 100;

        // Update balance by adding GST
        balance += gstAmount;

        // Emit GSTAdded event
        emit GSTAdded(gstAmount);

        return gstAmount;
    }

    function getTotalAmountWithGST(uint256 _amount) public view returns (uint256) {
        // Calculate GST amount
        uint256 gstAmount = (_amount * gstRate) / 100;

        // Return total amount including GST
        return _amount + gstAmount;
    }

    function setGSTRate(uint256 _newGSTRate) public {
        // Ensure that only the owner can change the GST rate
        require(msg.sender == owner, "You are not the owner of this account");

        // Update GST rate
        gstRate = _newGSTRate;

        // Emit event indicating the change in GST rate
        emit GSTRateChanged(_newGSTRate);
    }
}
