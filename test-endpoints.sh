#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://127.0.0.1:5000/api"
COOKIE_FILE="/tmp/test_cookies.txt"

echo -e "${YELLOW}=== Testing Expense Management Backend ===${NC}\n"

# 1. Register a test user
echo -e "${YELLOW}1. Registering test user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST ${API_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test'$(date +%s)'@example.com","password":"test12345"}')
echo "Response: $REGISTER_RESPONSE"
echo ""

# 2. Login
echo -e "${YELLOW}2. Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test'$(date +%s)'@example.com","password":"test12345"}' \
  -c $COOKIE_FILE)
echo "Response: $LOGIN_RESPONSE"
echo ""

# Extract user ID from login response
USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
echo "User ID: $USER_ID"
echo ""

# 3. Create Categories
echo -e "${YELLOW}3. Creating categories...${NC}"

echo "Creating 'Groceries' category..."
CAT1_RESPONSE=$(curl -s -X POST ${API_URL}/categories \
  -H "Content-Type: application/json" \
  -b $COOKIE_FILE \
  -d '{"name":"Groceries","icon":"🛒","color":"#4CAF50","type":"expense"}')
echo "Response: $CAT1_RESPONSE"
CAT1_ID=$(echo $CAT1_RESPONSE | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo ""

echo "Creating 'Transport' category..."
CAT2_RESPONSE=$(curl -s -X POST ${API_URL}/categories \
  -H "Content-Type: application/json" \
  -b $COOKIE_FILE \
  -d '{"name":"Transport","icon":"🚗","color":"#2196F3","type":"expense"}')
echo "Response: $CAT2_RESPONSE"
CAT2_ID=$(echo $CAT2_RESPONSE | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo ""

echo "Creating 'Salary' category (income)..."
CAT3_RESPONSE=$(curl -s -X POST ${API_URL}/categories \
  -H "Content-Type: application/json" \
  -b $COOKIE_FILE \
  -d '{"name":"Salary","icon":"💰","color":"#8BC34A","type":"income"}')
echo "Response: $CAT3_RESPONSE"
CAT3_ID=$(echo $CAT3_RESPONSE | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo ""

# 4. Get All Categories
echo -e "${YELLOW}4. Getting all categories...${NC}"
ALL_CATS=$(curl -s -X GET ${API_URL}/categories \
  -b $COOKIE_FILE)
echo "Response: $ALL_CATS"
echo ""

# 5. Create Expenses
echo -e "${YELLOW}5. Creating expenses...${NC}"

echo "Creating expense 1: Grocery shopping..."
EXP1_RESPONSE=$(curl -s -X POST ${API_URL}/expenses \
  -H "Content-Type: application/json" \
  -b $COOKIE_FILE \
  -d "{\"amount\":150.50,\"description\":\"Grocery shopping\",\"categoryId\":$CAT1_ID,\"type\":\"expense\"}")
echo "Response: $EXP1_RESPONSE"
EXP1_ID=$(echo $EXP1_RESPONSE | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo ""

echo "Creating expense 2: Uber ride..."
EXP2_RESPONSE=$(curl -s -X POST ${API_URL}/expenses \
  -H "Content-Type: application/json" \
  -b $COOKIE_FILE \
  -d "{\"amount\":25.00,\"description\":\"Uber ride to work\",\"categoryId\":$CAT2_ID,\"type\":\"expense\"}")
echo "Response: $EXP2_RESPONSE"
echo ""

echo "Creating income: Monthly salary..."
INC1_RESPONSE=$(curl -s -X POST ${API_URL}/expenses \
  -H "Content-Type: application/json" \
  -b $COOKIE_FILE \
  -d "{\"amount\":5000.00,\"description\":\"Monthly salary\",\"categoryId\":$CAT3_ID,\"type\":\"income\"}")
echo "Response: $INC1_RESPONSE"
echo ""

# 6. Get All Expenses
echo -e "${YELLOW}6. Getting all expenses...${NC}"
ALL_EXP=$(curl -s -X GET ${API_URL}/expenses \
  -b $COOKIE_FILE)
echo "Response: $ALL_EXP"
echo ""

# 7. Get Expense by ID
echo -e "${YELLOW}7. Getting expense by ID (ID: $EXP1_ID)...${NC}"
ONE_EXP=$(curl -s -X GET ${API_URL}/expenses/$EXP1_ID \
  -b $COOKIE_FILE)
echo "Response: $ONE_EXP"
echo ""

# 8. Update Expense
echo -e "${YELLOW}8. Updating expense (ID: $EXP1_ID)...${NC}"
UPDATE_EXP=$(curl -s -X PUT ${API_URL}/expenses/$EXP1_ID \
  -H "Content-Type: application/json" \
  -b $COOKIE_FILE \
  -d '{"amount":175.75,"description":"Updated: Grocery shopping at Whole Foods"}')
echo "Response: $UPDATE_EXP"
echo ""

# 9. Filter Expenses by Type
echo -e "${YELLOW}9. Getting only expenses (type=expense)...${NC}"
EXPENSE_ONLY=$(curl -s -X GET "${API_URL}/expenses?type=expense" \
  -b $COOKIE_FILE)
echo "Response: $EXPENSE_ONLY"
echo ""

# 10. Try to delete category with expenses (should fail)
echo -e "${YELLOW}10. Trying to delete category with expenses (should fail)...${NC}"
DELETE_CAT_FAIL=$(curl -s -X DELETE ${API_URL}/categories/$CAT1_ID \
  -b $COOKIE_FILE)
echo "Response: $DELETE_CAT_FAIL"
echo ""

# 11. Delete Expense
echo -e "${YELLOW}11. Deleting expense (ID: $EXP1_ID)...${NC}"
DELETE_EXP=$(curl -s -X DELETE ${API_URL}/expenses/$EXP1_ID \
  -b $COOKIE_FILE)
echo "Response: $DELETE_EXP"
echo ""

# 12. Verify expense is deleted
echo -e "${YELLOW}12. Verifying expense is deleted (should return 404)...${NC}"
VERIFY_DEL=$(curl -s -X GET ${API_URL}/expenses/$EXP1_ID \
  -b $COOKIE_FILE)
echo "Response: $VERIFY_DEL"
echo ""

# 13. Test unauthorized access
echo -e "${YELLOW}13. Testing unauthorized access (no cookies)...${NC}"
UNAUTH=$(curl -s -X GET ${API_URL}/expenses)
echo "Response: $UNAUTH"
echo ""

echo -e "${GREEN}=== Testing Complete ===${NC}"
echo "Cleaning up cookie file..."
rm -f $COOKIE_FILE
