#!/bin/bash
set -e

VERSION="v0.1.0"
RELEASE_DIR="../releases/${VERSION}"
HIJACK_DIR="../releases/${VERSION}-hijacked"
TAR_NAME="frontend-release.tar.gz"

echo "Simulating DNS Hijack by modifying the frontend artifact..."

if [ ! -d "$RELEASE_DIR" ]; then
  echo "Error: Release directory $RELEASE_DIR does not exist. Run build-release.sh first."
  exit 1
fi

# Create a copy of the release
rm -rf "$HIJACK_DIR"
cp -r "$RELEASE_DIR" "$HIJACK_DIR"

cd "$HIJACK_DIR"

# Extract the artifact
mkdir -p temp_extract
tar -xzf $TAR_NAME -C temp_extract

# Modify the frontend (Simulate an attacker injecting a malicious script or changing UI)
if [ -f temp_extract/index.html ]; then
  sed -i.bak 's/PS2 Security Demo/PS2 Security Demo (HACKED)/g' temp_extract/index.html
  rm temp_extract/index.html.bak
  echo "Successfully injected malicious payload into index.html"
else
  echo "Error: index.html not found in the archive."
  exit 1
fi

# Repackage the artifact without updating the digest or signatures!
cd temp_extract
tar -czf "../${TAR_NAME}" .
cd ..

# Cleanup
rm -rf temp_extract

echo ""
echo "🚨 HIJACK SIMULATION READY 🚨"
echo "The frontend artifact in releases/${VERSION}-hijacked/ has been tampered with."
echo "However, the release.json and sigstore bundle remain unchanged."
echo ""
echo "To test the browser extension:"
echo "1. Serve the legitimate release: npx serve ../releases/${VERSION}/"
echo "   -> Extension should show GREEN (VALID)"
echo "2. Serve the hijacked release: npx serve ../releases/${VERSION}-hijacked/"
echo "   -> Extension should show RED (INVALID)"
