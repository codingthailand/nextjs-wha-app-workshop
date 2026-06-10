---
name: project-onboarding
description: Use when a new developer asks about setup project. how to get started, what tech stack is used. Triggers on "โปรเจกต์ตั้งค่าอย่างไร", "โปรเจกต์นี้เริ่มต้นอย่างไร". or any orientation question from someone unfamiliar with the codebase.
compatibility: Use Node.js 22+
license: MIT
metadata: 
  author: Akenarin Komkoon
  version: "1.0"
---

## Gotchas

- ต้องติดตั้ง และปิด Docker Desktop ไว้
- ให้อธิบายการรันโปรเจกต์ และให้ใช้คำสั่ง npm run dev
- อย่าลืม copy หรือสร้าง .env ด้วย

## First-Time Setup Checklist

```bash
# 1. Install Deps
[ ] npm install

# 2. Copy env
[ ] cp .env.example .env

# 3. Pull DB Schema (Prisma ORM)
[ ] npx prisma db pull

# 4. Generate Prisma Client 
[ ] npx prisma generate

# 5. check lint
npm run lint
```

## Output

- ถ้าถามการ Setup ให้ตอบในรูปแบบของตาราง และอ่านง่าย