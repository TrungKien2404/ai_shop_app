#!/bin/sh

# Chay script kiem tra va seed du lieu neu database trong
echo "Running database checks and automatic seeding if needed..."
node check-and-seed.js

# Chay command chinh duoc truyen vao (npm start)
exec "$@"
