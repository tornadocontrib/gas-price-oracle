// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

/**
 * @dev Updates Polygon's recommended maxPriorityFeePerGas from polygon gas station
 */
contract GasPriceOracle {
    address public owner;

    uint32 public pastGasPrice;

    uint256 public GAS_UNIT = 1e9;

    uint32 public timestamp;

    /**
     * @dev Similar with how the chainlink's gas price feed works,
     * A new answer is written when the gas price moves 
     * more than the derivation thresold or heartbeat ( 2 hours )
     * have passed since the last answer was written onchain
     */
    uint32 public derivationThresold = 25;

    uint32 public heartbeat = 2 hours;

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    constructor() {
        owner = msg.sender;
        timestamp = uint32(block.timestamp);
    }

    function changeOwnership(address _owner) external onlyOwner {
        owner = _owner;
    }

    function changeGasUnit(uint32 _gasUnit) external onlyOwner {
        GAS_UNIT = _gasUnit;
    }

    function changeDerivationThresold(uint32 _derivationThresold) external onlyOwner {
        derivationThresold = _derivationThresold;
    }

    function changeHeartbeat(uint32 _heartbeat) external onlyOwner {
        heartbeat = _heartbeat;
    }

    function setGasPrice(uint32 _gasPrice) external onlyOwner {
        pastGasPrice = _gasPrice;
        timestamp = uint32(block.timestamp);
    }

    function gasPrice() external view returns (uint256) {
        return GAS_UNIT * uint256(pastGasPrice);
    }

    function maxFeePerGas() external view returns (uint256) {
        return block.basefee;
    }

    function maxPriorityFeePerGas() external view returns (uint256) {
        return GAS_UNIT * uint256(pastGasPrice);
    }
}