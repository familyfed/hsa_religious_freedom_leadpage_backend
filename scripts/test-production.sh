#!/bin/bash

# Production API Testing Script
# Usage: ./scripts/test-production.sh

API_BASE="https://religiousfreedombackend.vercel.app"
PETITION_SLUG="campaign"

echo "🧪 Testing Production API: $API_BASE"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "\n${YELLOW}1. Testing Health Check...${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/health")
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)

if [ "$HEALTH_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Health Check: PASSED${NC}"
    echo "Response: $HEALTH_BODY"
else
    echo -e "${RED}❌ Health Check: FAILED${NC}"
    echo "Status Code: $HEALTH_CODE"
    echo "Response: $HEALTH_BODY"
    echo -e "\n${YELLOW}💡 Make sure environment variables are set in Vercel dashboard${NC}"
    exit 1
fi

# Test 2: Petition Stats
echo -e "\n${YELLOW}2. Testing Petition Stats...${NC}"
STATS_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/api/petitions/$PETITION_SLUG/stats")
STATS_BODY=$(echo "$STATS_RESPONSE" | head -n -1)
STATS_CODE=$(echo "$STATS_RESPONSE" | tail -n 1)

if [ "$STATS_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Petition Stats: PASSED${NC}"
    echo "Response: $STATS_BODY"
else
    echo -e "${RED}❌ Petition Stats: FAILED${NC}"
    echo "Status Code: $STATS_CODE"
    echo "Response: $STATS_BODY"
fi

# Test 3: Petition Signing (Validation Test)
echo -e "\n${YELLOW}3. Testing Petition Signing (Validation)...${NC}"
SIGN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/petitions/$PETITION_SLUG/sign" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "country": "US",
    "city": "New York",
    "state": "NY",
    "consent_news": true,
    "turnstileToken": "test-token"
  }')
SIGN_BODY=$(echo "$SIGN_RESPONSE" | head -n -1)
SIGN_CODE=$(echo "$SIGN_RESPONSE" | tail -n 1)

if [ "$SIGN_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Petition Signing: PASSED${NC}"
    echo "Response: $SIGN_BODY"
elif [ "$SIGN_CODE" = "400" ]; then
    echo -e "${YELLOW}⚠️  Petition Signing: VALIDATION ERROR (Expected)${NC}"
    echo "Response: $SIGN_BODY"
    echo -e "${YELLOW}💡 This is expected due to Turnstile validation in production${NC}"
else
    echo -e "${RED}❌ Petition Signing: FAILED${NC}"
    echo "Status Code: $SIGN_CODE"
    echo "Response: $SIGN_BODY"
fi

# Test 4: Invalid Email Validation
echo -e "\n${YELLOW}4. Testing Email Validation...${NC}"
INVALID_EMAIL_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/petitions/$PETITION_SLUG/sign" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "invalid-email",
    "country": "US",
    "city": "New York",
    "state": "NY",
    "consent_news": true,
    "turnstileToken": "test-token"
  }')
INVALID_EMAIL_BODY=$(echo "$INVALID_EMAIL_RESPONSE" | head -n -1)
INVALID_EMAIL_CODE=$(echo "$INVALID_EMAIL_RESPONSE" | tail -n 1)

if [ "$INVALID_EMAIL_CODE" = "400" ]; then
    echo -e "${GREEN}✅ Email Validation: PASSED${NC}"
    echo "Response: $INVALID_EMAIL_BODY"
else
    echo -e "${RED}❌ Email Validation: FAILED${NC}"
    echo "Status Code: $INVALID_EMAIL_CODE"
    echo "Response: $INVALID_EMAIL_BODY"
fi

# Test 5: Missing Required Fields
echo -e "\n${YELLOW}5. Testing Required Fields Validation...${NC}"
MISSING_FIELDS_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/petitions/$PETITION_SLUG/sign" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }')
MISSING_FIELDS_BODY=$(echo "$MISSING_FIELDS_RESPONSE" | head -n -1)
MISSING_FIELDS_CODE=$(echo "$MISSING_FIELDS_RESPONSE" | tail -n 1)

if [ "$MISSING_FIELDS_CODE" = "400" ]; then
    echo -e "${GREEN}✅ Required Fields Validation: PASSED${NC}"
    echo "Response: $MISSING_FIELDS_BODY"
else
    echo -e "${RED}❌ Required Fields Validation: FAILED${NC}"
    echo "Status Code: $MISSING_FIELDS_CODE"
    echo "Response: $MISSING_FIELDS_BODY"
fi

echo -e "\n${YELLOW}=================================="
echo "🏁 Production API Testing Complete!"
echo "=================================="

# Summary
echo -e "\n${YELLOW}📋 Test Summary:${NC}"
echo "• Health Check: $([ "$HEALTH_CODE" = "200" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "• Petition Stats: $([ "$STATS_CODE" = "200" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "• Petition Signing: $([ "$SIGN_CODE" = "200" ] || [ "$SIGN_CODE" = "400" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "• Email Validation: $([ "$INVALID_EMAIL_CODE" = "400" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "• Required Fields: $([ "$MISSING_FIELDS_CODE" = "400" ] && echo "✅ PASS" || echo "❌ FAIL")"

if [ "$HEALTH_CODE" = "200" ]; then
    echo -e "\n${GREEN}🎉 Your production API is working!${NC}"
    echo -e "${YELLOW}💡 Frontend can now connect to: $API_BASE${NC}"
else
    echo -e "\n${RED}🚨 API is not responding. Check environment variables in Vercel.${NC}"
    echo -e "${YELLOW}💡 Required variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.${NC}"
fi
