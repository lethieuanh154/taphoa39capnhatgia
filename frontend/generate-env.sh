#!/bin/bash
echo "window.__env = {
  UserName: '${USERNAME}',
  LatestBranchId: '${LatestBranchId}',
  Password: '${Password}',
  retailer: '${retailer}'
};" > src/assets/env.js

echo "✅ Created src/assets/env.js"
