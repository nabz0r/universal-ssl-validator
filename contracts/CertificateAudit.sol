// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateAudit {
    struct Audit {
        string domain;
        bytes32 certificateHash;
        uint256 timestamp;
        bool validationResult;
        address auditor;
    }

    mapping(string => Audit[]) public domainAudits;
    
    event AuditRecorded(
        string domain,
        bytes32 certificateHash,
        uint256 timestamp,
        bool validationResult,
        address auditor
    );

    function recordAudit(
        string memory domain,
        bytes32 certificateHash,
        uint256 timestamp,
        bool validationResult
    ) public {
        Audit memory newAudit = Audit({
            domain: domain,
            certificateHash: certificateHash,
            timestamp: timestamp,
            validationResult: validationResult,
            auditor: msg.sender
        });

        domainAudits[domain].push(newAudit);
        
        emit AuditRecorded(
            domain,
            certificateHash,
            timestamp,
            validationResult,
            msg.sender
        );
    }

    function getAudits(string memory domain) public view returns (Audit[] memory) {
        return domainAudits[domain];
    }
}