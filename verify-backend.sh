#!/bin/bash

echo "==================================="
echo "   BACKEND DATA VERIFICATION"
echo "==================================="
echo ""

echo "📊 Checking JSON Server status..."
if lsof -i :3001 > /dev/null 2>&1; then
    echo "✅ JSON Server is RUNNING on port 3001"
else
    echo "❌ JSON Server is NOT running"
    echo "   Run: npm run dev:all"
    exit 1
fi

echo ""
echo "👥 USERS IN DATABASE:"
curl -s http://localhost:3001/users | jq -r '.[] | "  • \(.name) - \(.email) (ID: \(.id))"'
echo ""
echo "Total Users: $(curl -s http://localhost:3001/users | jq '. | length')"

echo ""
echo "👨‍⚕️ DOCTORS IN DATABASE:"
curl -s http://localhost:3001/doctors | jq -r '.[] | "  • \(.name) - \(.specialty)"' | head -6
echo ""
echo "Total Doctors: $(curl -s http://localhost:3001/doctors | jq '. | length')"

echo ""
echo "📅 APPOINTMENTS:"
curl -s http://localhost:3001/appointments | jq -r '.[] | "  • \(.doctorName) - \(.date) [\(.status)]"'
echo ""
echo "Total Appointments: $(curl -s http://localhost:3001/appointments | jq '. | length')"

echo ""
echo "==================================="
echo "Backend is storing data in: db.json"
echo "API Endpoint: http://localhost:3001"
echo "==================================="
