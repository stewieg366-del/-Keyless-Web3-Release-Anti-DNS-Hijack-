import { verifyRelease, TrustedReleaseMetadata } from '../src/index';

// Mock the sigstore library
jest.mock('sigstore', () => ({
  verify: jest.fn(),
}));

import { verify } from 'sigstore';

describe('Phase 3: Client-side Release Verifier', () => {
  const dummyArtifact = Buffer.from('test-frontend-content');
  const dummyBundle = { mock: 'bundle' };
  
  // computeSha256('test-frontend-content') -> 'b7a5a8a6be7b8c...'
  const validDigest = require('ethers').ethers.sha256(dummyArtifact).slice(2);

  const validMetadata: TrustedReleaseMetadata = {
    artifact: {
      digest: validDigest,
      algorithm: 'sha256',
    },
    signer: {
      identity: 'user@example.com',
      issuer: 'https://github.com/login/oauth',
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. Valid authorized release -> VALID', async () => {
    (verify as jest.Mock).mockResolvedValueOnce(true); // Mock successful verification
    
    const result = await verifyRelease(dummyArtifact, dummyBundle, validMetadata);
    expect(result).toBe('VALID');
    expect(verify).toHaveBeenCalledWith(dummyBundle, dummyArtifact, {
      certificateIdentityEmail: 'user@example.com',
      certificateIssuer: 'https://github.com/login/oauth'
    });
  });

  it('2. Modified frontend -> INVALID (digest mismatch)', async () => {
    const modifiedArtifact = Buffer.from('malicious-content');
    const result = await verifyRelease(modifiedArtifact, dummyBundle, validMetadata);
    
    // Should fail early on digest mismatch before even calling sigstore
    expect(result).toBe('INVALID');
    expect(verify).not.toHaveBeenCalled();
  });

  it('6. Wrong release digest in metadata -> INVALID', async () => {
    const badMetadata = { ...validMetadata, artifact: { ...validMetadata.artifact, digest: 'badhash' } };
    const result = await verifyRelease(dummyArtifact, dummyBundle, badMetadata);
    
    expect(result).toBe('INVALID');
  });

  it('7. Wrong signer identity -> INVALID (Sigstore rejects)', async () => {
    (verify as jest.Mock).mockRejectedValueOnce(new Error('Certificate identity mismatch'));
    
    const badIdentityMetadata = { ...validMetadata, signer: { ...validMetadata.signer, identity: 'hacker@evil.com' } };
    const result = await verifyRelease(dummyArtifact, dummyBundle, badIdentityMetadata);
    
    expect(result).toBe('INVALID');
  });

  it('9. Invalid/tampered Sigstore bundle -> INVALID', async () => {
    (verify as jest.Mock).mockRejectedValueOnce(new Error('Signature verification failed'));
    
    const result = await verifyRelease(dummyArtifact, { fake: 'bundle' }, validMetadata);
    
    expect(result).toBe('INVALID');
  });

  it('10. Missing verification infrastructure -> UNKNOWN', async () => {
    // Pass null bundle
    const result = await verifyRelease(dummyArtifact, null as any, validMetadata);
    expect(result).toBe('UNKNOWN');
  });
});
