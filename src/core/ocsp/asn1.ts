import * as asn1 from 'asn1.js';
import { X509Certificate } from 'crypto';
import * as crypto from 'crypto';

// ASN.1 definitions pour OCSP (comme précédemment)...

export function createIssuerNameHash(issuerCert: X509Certificate): Buffer {
  // Extract issuer name from certificate
  const issuerName = extractIssuerName(issuerCert);
  
  // Calculate SHA-1 hash of the issuer name
  const hash = crypto.createHash('sha1');
  hash.update(issuerName);
  return hash.digest();
}

export function createIssuerKeyHash(issuerCert: X509Certificate): Buffer {
  // Extract the public key from the issuer certificate
  const publicKey = extractPublicKey(issuerCert);
  
  // Calculate SHA-1 hash of the public key
  const hash = crypto.createHash('sha1');
  hash.update(publicKey);
  return hash.digest();
}

// Helper function to extract issuer name in DER format
function extractIssuerName(cert: X509Certificate): Buffer {
  const IssuerName = asn1.define('IssuerName', function(this: any) {
    this.seq().obj(
      this.key('tbsCertificate').seq().obj(
        this.key('version').explicit(0).int().optional(),
        this.key('serialNumber').int(),
        this.key('signature').seq().obj(
          this.key('algorithm').objid(),
          this.key('parameters').optional()
        ),
        this.key('issuer').seq().obj(
          // RFC 5280 Name structure
          this.key('rdnSequence').seqof(RelativeDistinguishedName)
        )
      )
    );
  });

  const RelativeDistinguishedName = asn1.define('RelativeDistinguishedName', function(this: any) {
    this.setof(AttributeTypeAndValue);
  });

  const AttributeTypeAndValue = asn1.define('AttributeTypeAndValue', function(this: any) {
    this.seq().obj(
      this.key('type').objid(),
      this.key('value').any()
    );
  });

  try {
    const decoded = IssuerName.decode(cert.raw, 'der');
    return IssuerName.encode(decoded.tbsCertificate.issuer, 'der');
  } catch (error) {
    throw new Error(`Failed to extract issuer name: ${error.message}`);
  }
}

// Helper function to extract public key in DER format
function extractPublicKey(cert: X509Certificate): Buffer {
  const PublicKeyInfo = asn1.define('PublicKeyInfo', function(this: any) {
    this.seq().obj(
      this.key('tbsCertificate').seq().obj(
        this.key('version').explicit(0).int().optional(),
        this.key('serialNumber').int(),
        this.key('signature').seq().obj(
          this.key('algorithm').objid(),
          this.key('parameters').optional()
        ),
        this.key('issuer').any(),
        this.key('validity').seq().obj(
          this.key('notBefore').utctime(),
          this.key('notAfter').utctime()
        ),
        this.key('subject').any(),
        this.key('subjectPublicKeyInfo').seq().obj(
          this.key('algorithm').seq().obj(
            this.key('algorithm').objid(),
            this.key('parameters').optional()
          ),
          this.key('subjectPublicKey').bitstr()
        )
      )
    );
  });

  try {
    const decoded = PublicKeyInfo.decode(cert.raw, 'der');
    return PublicKeyInfo.encode(decoded.tbsCertificate.subjectPublicKeyInfo, 'der');
  } catch (error) {
    throw new Error(`Failed to extract public key: ${error.message}`);
  }
}

export function buildOCSPRequest(cert: X509Certificate, issuerCert: X509Certificate): Buffer {
  // Create the request structure with proper hashing
  const request = {
    tbsRequest: {
      version: 0,
      requestList: [{
        reqCert: {
          hashAlgorithm: {
            algorithm: [2, 16, 840, 1, 101, 3, 4, 2, 1] // sha256
          },
          issuerNameHash: createIssuerNameHash(issuerCert),
          issuerKeyHash: createIssuerKeyHash(issuerCert),
          serialNumber: extractSerialNumber(cert)
        }
      }]
    }
  };

  return OCSPRequest.encode(request, 'der');
}