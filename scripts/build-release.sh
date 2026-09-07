#!/bin/bash
set -e

VERSION="v0.1.0"
APP_DIR="../app"
RELEASE_DIR="../releases/${VERSION}"
TAR_NAME="frontend-release.tar.gz"
MANIFEST_NAME="release.json"

echo "Building frontend..."
cd $APP_DIR
npm run build

echo "Creating deterministic archive..."
mkdir -p $RELEASE_DIR

# Note: For strict determinism across OSes, consider tools like `npm pack` or a custom python/node script.
# For this demo, we package the dist directory.
cd dist
# Using standard tar for MacOS compatibility in demo. For production, GNU tar with --mtime, --sort, etc is recommended.
tar -czf "../../releases/${VERSION}/${TAR_NAME}" .

cd "../../releases/${VERSION}"

echo "Generating SHA-256 digest..."
DIGEST=$(shasum -a 256 $TAR_NAME | awk '{print $1}')
echo "Digest: $DIGEST"

# 5. Sign the artifact with Sigstore keyless signing
echo "Requesting keyless signature via Cosign..."

if ! command -v cosign &> /dev/null; then
    echo "Error: cosign is not installed."
    echo "Please install it to continue:"
    echo "  macOS: brew install cosign"
    echo "  Linux: go install github.com/sigstore/cosign/v2/cmd/cosign@latest"
    exit 1
fi

cosign sign-blob \
  --output-signature ${TAR_NAME}.sig \
  --output-certificate ${TAR_NAME}.pem \
  --bundle ${TAR_NAME}.sigstore.json \
  $TAR_NAME

# Update metadata with sigstore bundle info
cat <<EOF > $MANIFEST_NAME
{
  "application": "PS2 Web3 Security Demo",
  "version": "${VERSION}",
  "network": {
    "name": "Ethereum Sepolia",
    "chainId": 11155111
  },
  "artifact": {
    "type": "frontend-release",
    "digest": "${DIGEST}",
    "algorithm": "sha256"
  },
  "signer": {
    "identity": "OIDC Identity (via Cosign)",
    "issuer": "Public Fulcio"
  },
  "sigstore": {
    "bundle": "${TAR_NAME}.sigstore.json"
  }
}
EOF

echo "Release and signing complete!"
echo "Artifacts are stored in releases/${VERSION}/"
