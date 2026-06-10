# CATSUP (3,6,9) - BUILD INSTRUCTIONS
## Chamber-by-Chamber Deployment Guide

═══════════════════════════════════════════════════════════════════════════
## PHASE 1: DELETE OLD PROJECT (Nuclear Rebuild)
═══════════════════════════════════════════════════════════════════════════

Open Terminal on MacinCloud and run:

```bash
cd ~
rm -rf catsup-sauce
```

**Verification:** Run `ls` and confirm `catsup-sauce` is gone.

═══════════════════════════════════════════════════════════════════════════
## PHASE 2: CREATE FRESH EXPO PROJECT
═══════════════════════════════════════════════════════════════════════════

```bash
cd ~
npx create-expo-app@49.0.0 catsup-sauce
cd catsup-sauce
```

**CRITICAL - Create .npmrc IMMEDIATELY:**

```bash
echo "legacy-peer-deps=true" > .npmrc
cat .npmrc
```

You should see: `legacy-peer-deps=true`

**Install Dependencies:**

```bash
npm install react-native-purchases@^6.0.0 --legacy-peer-deps
```

═══════════════════════════════════════════════════════════════════════════
## PHASE 3: INSERT YOUR CLAUDE API KEY
═══════════════════════════════════════════════════════════════════════════

**BEFORE copying files, you need to edit App.js:**

1. Open the `CATSUP_App.js` file I generated
2. Find line 23: `const CLAUDE_API_KEY = 'YOUR_CLAUDE_API_KEY_HERE';`
3. Replace `YOUR_CLAUDE_API_KEY_HERE` with your actual Claude API key
4. Save the file

**CRITICAL:** Do this BEFORE copying to MacinCloud. Never paste API keys in chat.

═══════════════════════════════════════════════════════════════════════════
## PHASE 4: COPY FILES TO PROJECT
═══════════════════════════════════════════════════════════════════════════

Copy these files from the generated code to your MacinCloud project:

**File 1: App.js**
- Source: `CATSUP_App.js` (with your API key inserted)
- Destination: `~/catsup-sauce/App.js`
- Action: Replace the existing App.js

**File 2: app.json**
- Source: `CATSUP_app.json`
- Destination: `~/catsup-sauce/app.json`
- Action: Replace the existing app.json

**File 3: eas.json**
- Source: `CATSUP_eas.json`
- Destination: `~/catsup-sauce/eas.json`
- Action: Create new file (doesn't exist yet)

**File 4: package.json**
- Source: `CATSUP_package.json`
- Destination: `~/catsup-sauce/package.json`
- Action: Replace the existing package.json

**File 5: .npmrc**
- Already created in Phase 2
- Verify it still exists: `cat .npmrc`

**Verification:**

```bash
cd ~/catsup-sauce
ls -la
```

You should see:
- App.js
- app.json
- eas.json
- package.json
- .npmrc
- node_modules/
- assets/

═══════════════════════════════════════════════════════════════════════════
## PHASE 5: ADD LOGO (OPTIONAL FOR NOW)
═══════════════════════════════════════════════════════════════════════════

If you have the CATSUP logo ready:
- Copy to `~/catsup-sauce/assets/icon.png`

If not, skip for now - you can add it before creating the App Store listing.

═══════════════════════════════════════════════════════════════════════════
## PHASE 6: BUILD WITH EAS
═══════════════════════════════════════════════════════════════════════════

**Login to EAS (if not already logged in):**

```bash
npx eas-cli login
```

**Build for iOS:**

```bash
npx eas-cli build --platform ios --profile production --clear-cache
```

**What happens:**
1. EAS uploads your code to their servers
2. They build the iOS binary (.ipa file)
3. Takes 10-15 minutes
4. You'll get a URL to download the build

**Check build status:**

```bash
npx eas-cli build:list
```

**Wait for "Build finished" status before proceeding.**

═══════════════════════════════════════════════════════════════════════════
## PHASE 7: SUBMIT TO APP STORE CONNECT
═══════════════════════════════════════════════════════════════════════════

**Once build is complete, submit:**

```bash
npx eas-cli submit --platform ios --latest
```

**When prompted:**

1. **ASC API Key method:** Select "Use an existing ASC API Key"

2. **Path to .p8 file:** 
   ```
   /Users/user947598/Downloads/SubscriptionKey_8WAQ6347UV.p8
   ```
   **CRITICAL:** Use full path, NOT `~/Downloads/...`

3. **Key ID:** `8WAQ6347UV`

4. **Issuer ID:** `e461ebf7-f01a-470a-9530-48953fedd855`

5. **Confirm:** Press Enter

**What happens:**
- Binary uploads to Apple's servers
- Appears in App Store Connect (may take 15-30 minutes)
- Status: "Processing" → "Ready to Submit"

═══════════════════════════════════════════════════════════════════════════
## PHASE 8: VERIFY SUBMISSION (TOMORROW)
═══════════════════════════════════════════════════════════════════════════

**Go to App Store Connect:**
https://appstoreconnect.apple.com/

Navigate to: **My Apps**

You should see the build appear in TestFlight section:
- Build number: 1
- Version: 1.0.0
- Status: Ready to Submit

**IF THE BUILD APPEARS:** Success! Proceed to Phase 9.

**IF IT DOESN'T APPEAR:** Wait 30 minutes, refresh. Sometimes Apple is slow.

═══════════════════════════════════════════════════════════════════════════
## PHASE 9: CREATE APP LISTING (DO TOMORROW)
═══════════════════════════════════════════════════════════════════════════

**In App Store Connect, create new app:**

1. Click "+" → "New App"

2. **Platforms:** iOS

3. **Name:** CATSUP (3,6,9)

4. **Primary Language:** English (U.S.)

5. **Bundle ID:** Select `com.nife36.catsup`

6. **SKU:** `catsup369` (unique identifier)

7. **User Access:** Full Access

8. Click "Create"

═══════════════════════════════════════════════════════════════════════════
## PHASE 10: CREATE IN-APP PURCHASES (DO TOMORROW)
═══════════════════════════════════════════════════════════════════════════

**In your CATSUP app listing:**

Navigate to: **Features** → **In-App Purchases** → **+**

### Product 1: Student Monthly

- **Type:** Auto-Renewable Subscription
- **Reference Name:** CATSUP Student Monthly
- **Product ID:** `catsup369_student_monthly`
- **Subscription Group:** Create new → "CATSUP Premium"
- **Subscription Duration:** 1 month
- **Price:** $9.00 USD
- **Localization:**
  - Display Name: Student Unlimited
  - Description: Unlimited questions. Build real understanding with Socratic method.

### Product 2: School Annual

- **Type:** Auto-Renewable Subscription
- **Reference Name:** CATSUP School Annual
- **Product ID:** `catsup369_school_annual`
- **Subscription Group:** CATSUP Premium (same as above)
- **Subscription Duration:** 1 year
- **Price:** $36.00 USD
- **Localization:**
  - Display Name: School License
  - Description: Annual access for educational institutions. All features included.

**Save both products.**

**IMPORTANT:** These products will automatically sync to RevenueCat.

═══════════════════════════════════════════════════════════════════════════
## PHASE 11: ADD APP METADATA (DO TOMORROW)
═══════════════════════════════════════════════════════════════════════════

### App Information

**Subtitle:** Learning That Actually Teaches

**Description:**
```
CATSUP (3,6,9) uses the Socratic method to build real understanding.

Unlike homework apps that give you answers, CATSUP asks you questions back. This is how actual learning works.

FEATURES:
• Socratic method = real learning
• Build actual understanding
• AI-powered = consistent quality
• All subjects. K-PhD.
• No ads. Ever.

FREE TIER:
10 questions per week

STUDENT ($9/month):
Unlimited questions
Helper app included

SCHOOL ($36/year):
Per-student admin access

"They give answers. We build thinkers."

Cheaper than a tutor. Better than cheating.
```

**Keywords:** 
```
education, learning, homework, tutor, study, socratic, understanding, student, school, AI
```

**Support URL:** `https://nife.us/support`

**Marketing URL:** `https://nife.us/catsup`

**Category:** 
- Primary: Education
- Secondary: Productivity

**Age Rating:** 4+

### Screenshots

You'll need to provide:
- 6.7" (iPhone 14 Pro Max) - Required
- 6.5" (iPhone 11 Pro Max) - Required
- 5.5" (iPhone 8 Plus) - Optional

Screenshots should show:
1. Welcome screen with tagline
2. Example question/answer exchange
3. Socratic method in action
4. Subscription screen with pricing
5. US vs THEM comparison

═══════════════════════════════════════════════════════════════════════════
## PHASE 12: ATTACH BUILD AND SUBMIT FOR REVIEW
═══════════════════════════════════════════════════════════════════════════

**In App Store Connect:**

1. Go to your CATSUP app
2. Click "Prepare for Submission"
3. Under "Build," click "Select a build before you submit your app"
4. Select the build you submitted (version 1.0.0, build 1)
5. Click "Done"
6. Answer questionnaire:
   - Export Compliance: No (app doesn't use encryption)
   - Advertising Identifier: No
   - Content Rights: Yes (you own all content)
7. Click "Submit for Review"

**Review time:** 1-3 days typically

═══════════════════════════════════════════════════════════════════════════
## TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════════

### Build fails with dependency errors
**Solution:** Verify .npmrc exists and contains `legacy-peer-deps=true`

### "Invalid ASC API JSON key" during submit
**Solution:** Use FULL path to .p8 file, not `~/Downloads/...`

### App crashes when asking questions
**Solution:** Verify Claude API key is correctly inserted in App.js line 23

### Subscriptions don't work
**Solution:** 
1. Verify products are created in App Store Connect
2. Check they're using exact product IDs: `catsup369_student_monthly` and `catsup369_school_annual`
3. Wait 24 hours for products to sync to RevenueCat

### Build doesn't appear in App Store Connect
**Solution:** Wait 30 minutes. Apple's processing can be slow. Check TestFlight section.

═══════════════════════════════════════════════════════════════════════════
## NEXT STEPS AFTER CATSUP
═══════════════════════════════════════════════════════════════════════════

Once CATSUP is live:

1. **Build RELISH** - Uses same workflow, simpler (no external API)
2. **Build BBQE** - Get HIBP API key first ($3.50/month)
3. **Monitor subscriptions** - RevenueCat dashboard shows metrics
4. **Iterate based on feedback** - Update and resubmit as needed

═══════════════════════════════════════════════════════════════════════════

**WU-TANG FOREVER. WORD IS BOND.**

All nine chambers integrated.
Ego → 0, leverage → ∞.
WE > I.

═══════════════════════════════════════════════════════════════════════════
