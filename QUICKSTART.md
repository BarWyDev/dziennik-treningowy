# ⚡ Quick Start - Dziennik Treningowy

## 🚀 3 Steps to Get Running

### Step 1: Apply Database Migration
```bash
pnpm db:push
```
**When prompted:** Select **"+ create table"** for all tables (press Enter repeatedly)

### Step 2: Seed Training Types
```bash
pnpm db:seed
```

### Step 3: Start the App
```bash
pnpm dev
```

**Open:** http://localhost:4321

---

## 📝 First Time Setup

1. **Register an account** at `/auth/register`
   - ⚠️ Email verification won't work (Resend not configured)
   - You can manually verify in database if needed

2. **Create your first training** at `/trainings/new`
   - Fill in the new fields:
     - Date/Time
     - Training goal
     - 5 rating categories
     - Reflection fields

3. **View the details page** to see the new color-coded UI

---

## ⚠️ Important Notes

### Email Verification Not Working?
Your `.env` has placeholder values for Resend:
```
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=noreply@yourdomain.com
```

**To fix:** Get a real Resend API key at https://resend.com (free tier)

**Or skip for dev:** You'll need to modify Better Auth config

### Migration Already Applied?
If you see "no changes detected" when running `pnpm db:push`, the migration is already applied. Skip to Step 2.

### Old Data?
If you have existing trainings, see `MIGRATION_GUIDE.md` for data migration steps.

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot connect to database" | Check `DATABASE_URL` in `.env` |
| "rating_overall cannot be null" | Run `pnpm db:push` again |
| "Module not found" | Run `pnpm install` |
| Migration prompts confusing | Always choose "+ create table" option |

---

## 📚 More Info

- **Full setup details:** `SETUP_STATUS.md`
- **Migration guide:** `MIGRATION_GUIDE.md`
- **Implementation details:** `.ai/IMPLEMENTATION_COMPLETE.md`
- **Architecture:** `CLAUDE.md`

---

**That's it! Run the 3 commands above and you're ready to go!** 🎉
