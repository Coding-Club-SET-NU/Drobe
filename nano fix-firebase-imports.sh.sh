#!/bin/bash
echo "🔧 Fixing incorrect firebase import paths..."
find . -type f -name "*.js" -exec sed -i 's|from '\''\./firebase'\''|from '\''./screens/firebase'\''|g' {} +
echo "✅ Done!"
