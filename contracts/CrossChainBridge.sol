// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CrossChainBridge is Ownable, ReentrancyGuard {
    // Structure pour les transferts cross-chain
    struct Transfer {
        address initiator;
        address recipient;
        bytes data;
        uint256 timestamp;
        uint256 destinationChainId;
        TransferStatus status;
    }

    // Statut des transferts
    enum TransferStatus { Pending, Completed, Failed }

    // Mapping des transferts par leur ID
    mapping(bytes32 => Transfer) public transfers;
    
    // Liste des validateurs autorisés par chaîne
    mapping(uint256 => mapping(address => bool)) public validators;
    
    // Nombre minimum de validations requis par chaîne
    mapping(uint256 => uint256) public requiredValidations;

    // Mapping pour suivre les validations
    mapping(bytes32 => mapping(address => bool)) public validations;
    mapping(bytes32 => uint256) public validationCount;

    // Events
    event TransferInitiated(
        bytes32 indexed transferId,
        address indexed initiator,
        address indexed recipient,
        uint256 destinationChainId
    );

    event TransferCompleted(
        bytes32 indexed transferId,
        address indexed recipient
    );

    event TransferFailed(
        bytes32 indexed transferId,
        string reason
    );

    event ValidatorAdded(
        uint256 indexed chainId,
        address indexed validator
    );

    event ValidatorRemoved(
        uint256 indexed chainId,
        address indexed validator
    );

    constructor() {
        // Initialisation des validations requises par défaut
        requiredValidations[1] = 2; // Ethereum Mainnet
        requiredValidations[137] = 3; // Polygon
        requiredValidations[56] = 3; // BSC
    }

    /**
     * Initie un transfert cross-chain
     */
    function initiateTransfer(
        address recipient,
        bytes calldata data,
        uint256 destinationChainId
    ) external nonReentrant returns (bytes32) {
        require(recipient != address(0), "Invalid recipient");
        require(destinationChainId != block.chainid, "Invalid destination chain");

        bytes32 transferId = keccak256(
            abi.encodePacked(
                block.timestamp,
                msg.sender,
                recipient,
                data,
                destinationChainId
            )
        );

        transfers[transferId] = Transfer({
            initiator: msg.sender,
            recipient: recipient,
            data: data,
            timestamp: block.timestamp,
            destinationChainId: destinationChainId,
            status: TransferStatus.Pending
        });

        emit TransferInitiated(transferId, msg.sender, recipient, destinationChainId);
        return transferId;
    }

    /**
     * Valide un transfert (appelé par les validateurs)
     */
    function validateTransfer(bytes32 transferId) external {
        require(
            validators[block.chainid][msg.sender],
            "Not an authorized validator"
        );

        Transfer storage transfer = transfers[transferId];
        require(
            transfer.status == TransferStatus.Pending,
            "Invalid transfer status"
        );

        require(
            !validations[transferId][msg.sender],
            "Already validated"
        );

        validations[transferId][msg.sender] = true;
        validationCount[transferId]++;

        if (validationCount[transferId] >= requiredValidations[block.chainid]) {
            completeTransfer(transferId);
        }
    }

    /**
     * Complète un transfert après validations suffisantes
     */
    function completeTransfer(bytes32 transferId) internal {
        Transfer storage transfer = transfers[transferId];
        transfer.status = TransferStatus.Completed;

        emit TransferCompleted(transferId, transfer.recipient);
    }

    /**
     * Ajoute un validateur pour une chaîne spécifique
     */
    function addValidator(address validator, uint256 chainId) external onlyOwner {
        require(validator != address(0), "Invalid validator address");
        require(!validators[chainId][validator], "Validator already exists");

        validators[chainId][validator] = true;
        emit ValidatorAdded(chainId, validator);
    }

    /**
     * Retire un validateur pour une chaîne spécifique
     */
    function removeValidator(address validator, uint256 chainId) external onlyOwner {
        require(validators[chainId][validator], "Validator doesn't exist");

        validators[chainId][validator] = false;
        emit ValidatorRemoved(chainId, validator);
    }

    /**
     * Met à jour le nombre de validations requises pour une chaîne
     */
    function updateRequiredValidations(
        uint256 chainId,
        uint256 count
    ) external onlyOwner {
        require(count > 0, "Invalid validation count");
        requiredValidations[chainId] = count;
    }

    /**
     * Récupère le statut d'un transfert
     */
    function getTransferStatus(bytes32 transferId) external view returns (TransferStatus) {
        return transfers[transferId].status;
    }

    /**
     * Vérifie si un transfert est validé par un validateur spécifique
     */
    function isValidatedBy(
        bytes32 transferId,
        address validator
    ) external view returns (bool) {
        return validations[transferId][validator];
    }
}