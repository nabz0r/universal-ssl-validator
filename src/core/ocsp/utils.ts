import { X509Certificate } from 'crypto';
import * as asn1 from 'asn1.js';

// ASN.1 definition for Authority Information Access extension
const AuthorityInfoAccess = asn1.define('AuthorityInfoAccess', function(this: any) {
  this.seqof(AccessDescription);
});

const AccessDescription = asn1.define('AccessDescription', function(this: any) {
  this.seq().obj(
    this.key('accessMethod').objid(),
    this.key('accessLocation').explicit(6).ia5str()
  );
});

// OCSP AccessMethod OID: 1.3.6.1.5.5.7.48.1
const OCSP_METHOD_OID = [1, 3, 6, 1, 5, 5, 7, 48, 1];

export function extractOCSPUrl(cert: X509Certificate): string | null {
  try {
    // Get the Authority Information Access extension
    const extensions = cert.raw;
    let aiaExtension = findAIAExtension(extensions);
    
    if (!aiaExtension) {
      console.debug('No AIA extension found');
      return null;
    }

    // Decode the extension value
    const accessDescriptions = AuthorityInfoAccess.decode(aiaExtension, 'der');

    // Find OCSP URL
    for (const desc of accessDescriptions) {
      if (desc.accessMethod.join('.') === OCSP_METHOD_OID.join('.')) {
        return desc.accessLocation;
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting OCSP URL:', error);
    return null;
  }
}

function findAIAExtension(certBuffer: Buffer): Buffer | null {
  // AIA extension OID: 1.3.6.1.5.5.7.1.1
  const AIA_OID = '1.3.6.1.5.5.7.1.1';

  try {
    // Parse certificate structure to find AIA extension
    // Note: This is a simplified implementation. In practice,
    // we should use proper X.509 certificate parsing.
    const certAsn1 = asn1.define('Certificate', function(this: any) {
      this.seq().obj(
        this.key('tbsCertificate').seq().obj(
          this.key('version').explicit(0).int().optional(),
          this.key('serialNumber').int(),
          this.key('signature').seq().obj(
            this.key('algorithm').objid(),
            this.key('parameters').optional()
          ),
          this.key('issuer').use(Name),
          this.key('validity').seq().obj(
            this.key('notBefore').utctime(),
            this.key('notAfter').utctime()
          ),
          this.key('subject').use(Name),
          this.key('subjectPublicKeyInfo').seq().obj(
            this.key('algorithm').seq().obj(
              this.key('algorithm').objid(),
              this.key('parameters').optional()
            ),
            this.key('subjectPublicKey').bitstr()
          ),
          this.key('extensions').explicit(3).seqof(Extension).optional()
        )
      );
    });

    const Name = asn1.define('Name', function(this: any) {
      this.choice({
        rdnSequence: this.seqof(RelativeDistinguishedName)
      });
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

    const Extension = asn1.define('Extension', function(this: any) {
      this.seq().obj(
        this.key('extnID').objid(),
        this.key('critical').bool().def(false),
        this.key('extnValue').octstr()
      );
    });

    const cert = certAsn1.decode(certBuffer, 'der');
    const extensions = cert.tbsCertificate.extensions;

    for (const ext of extensions) {
      if (ext.extnID.join('.') === AIA_OID) {
        return ext.extnValue;
      }
    }

    return null;
  } catch (error) {
    console.error('Error finding AIA extension:', error);
    return null;
  }
}

export function calculateCertificateHash(cert: X509Certificate, algorithm = 'sha256'): Buffer {
  const crypto = require('crypto');
  const hash = crypto.createHash(algorithm);
  hash.update(cert.raw);
  return hash.digest();
}

export function extractSerialNumber(cert: X509Certificate): Buffer {
  return Buffer.from(cert.serialNumber, 'hex');
}