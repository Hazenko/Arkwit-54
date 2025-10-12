#!/bin/bash

echo "Testing Arkwit 54 API - Security Check..."
echo ""

# Test Registration
echo "1. Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "محمد أحمد سعيد",
    "email": "secure-test@example.com",
    "phone": "0509876543",
    "password": "secure123456",
    "role": "user"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
  echo "✓ Registration successful"
  TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  
  # Check if passwordHash is exposed
  if echo "$REGISTER_RESPONSE" | grep -q "passwordHash"; then
    echo "✗ SECURITY ISSUE: passwordHash exposed in registration response!"
    echo "Response: $REGISTER_RESPONSE"
    exit 1
  else
    echo "✓ Security check passed: no passwordHash in response"
  fi
else
  echo "✗ Registration failed: $REGISTER_RESPONSE"
  exit 1
fi

echo ""

# Test Get Current User
echo "2. Testing Get Current User..."
ME_RESPONSE=$(curl -s -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN")

if echo "$ME_RESPONSE" | grep -q "fullName"; then
  echo "✓ Get current user successful"
  
  # Check if passwordHash is exposed
  if echo "$ME_RESPONSE" | grep -q "passwordHash"; then
    echo "✗ SECURITY ISSUE: passwordHash exposed in /api/auth/me response!"
    echo "Response: $ME_RESPONSE"
    exit 1
  else
    echo "✓ Security check passed: no passwordHash in response"
  fi
else
  echo "✗ Get current user failed: $ME_RESPONSE"
  exit 1
fi

echo ""
echo "All security checks passed! ✓"
echo "No password hashes exposed in API responses."
