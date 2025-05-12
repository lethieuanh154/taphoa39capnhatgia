#!/bin/bash

echo "window.__env = {
  LatestBranchId: '${LatestBranchId}',
  UserName: '${UserName}',
  Password: '${Password}',
  retailer: '${retailer}'
};" > src/assets/env.js

echo "✅ Created src/assets/env.js"
