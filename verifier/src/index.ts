import { verify } from 'sigstore';
import { ethers } from 'ethers';

export type VerificationState = 'VALID' | 'INVALID' | 'UNKNOWN';

export interface TrustedReleaseMetadata {
  artifact: {
    digest: string;
    algorithm: string;
  };
  signer: {
    identity: string;
    issuer: string;
  };
}

/**
 * Verifies a frontend release artifact against expected metadata and a Sigstore bundle.
 */
export async function verifyRelease(
  artifactBuffer: Buffer | Uint8Array,
  bundleJson: any,
  trustedMetadata: TrustedReleaseMetadata
): Promise<VerificationState> {
  try {
    if (!artifactBuffer || !bundleJson || !trustedMetadata) {
      console.error("Missing required verification inputs.");
      return 'UNKNOWN';
    }

    // 1. Compute digest of the downloaded artifact
    const artifactDigest = computeSha256(artifactBuffer);

    // 2. Compare against expected digest in trusted metadata
    if (artifactDigest !== trustedMetadata.artifact.digest) {
      console.error(`Digest mismatch. Expected: ${trustedMetadata.artifact.digest}, Got: ${artifactDigest}`);
      return 'INVALID';
    }

    // 3. Verify Sigstore bundle (this checks signature, cert, Rekor transparency log)
    try {
      await verify(bundleJson, Buffer.from(artifactBuffer), {
        certificateIssuer: trustedMetadata.signer.issuer,
        certificateIdentityEmail: trustedMetadata.signer.identity,
      });
    } catch (sigstoreErr: any) {
      console.error("Sigstore verification failed:", sigstoreErr.message);
      return 'INVALID';
    }

    return 'VALID';

  } catch (error: any) {
    console.error("Verification engine encountered an unknown error:", error);
    return 'UNKNOWN';
  }
}

/**
 * Helper to compute SHA-256 using ethers (compatible with both Node and Browser).
 */
export function computeSha256(data: Buffer | Uint8Array): string {
  // ethers.sha256 expects a DataHexString or Uint8Array
  // Output is a hex string prefixed with 0x. We strip the 0x for standard representation.
  const hash = ethers.sha256(data);
  return hash.startsWith('0x') ? hash.slice(2) : hash;
}
