# SB Developers - Discord Bot & Storefront Integration Guide

This bot connects your **SB Developers** Discord community (`https://discord.gg/JPfmWeqMMC`) with your storefront website (`https://sbdevelopers.netlify.app`), automatically welcoming new members, verifying customers, and granting roles.

---

## ⚡ Quick 5-Minute Setup

### Step 1: Create Your Discord Application & Bot
1. Visit the **[Discord Developer Portal](https://discord.com/developers/applications)**.
2. Click **"New Application"** in the top right.
   - Name it: `SB Developers Bot` (or whatever you prefer).
3. In **General Information**:
   - Copy the **Application ID (Client ID)**.
   - Paste it into `Storefornt/assets/js/products.js`:
     ```javascript
     STORE_CONFIG.discordClientId = "YOUR_CLIENT_ID_HERE";
     ```
   - Also paste it into `Storefornt/discord-bot/.env` as `CLIENT_ID`.
4. In **OAuth2** -> **General**:
   - Under **Redirects**, click **Add Redirect**:
     - For production: `https://sbdevelopers.netlify.app/`
     - For local testing: `http://localhost:5500/` (or your local URL)
   - Click **Save Changes**.
5. In **Bot**:
   - Click **Reset Token** and copy your **Bot Token**.
   - Paste it into `Storefornt/discord-bot/.env` as `DISCORD_TOKEN`.
   - Scroll down to **Privileged Gateway Intents**:
     - Enable **Server Members Intent** ✅
     - Enable **Message Content Intent** ✅
   - Click **Save Changes**.
6. In **OAuth2** -> **URL Generator**:
   - Under **Scopes**: check `bot` and `applications.commands`.
   - Under **Bot Permissions**: check `Administrator` (or `Manage Roles`, `Send Messages`, `Embed Links`).
   - Copy the generated URL and open it in your browser to invite the bot to your **SB Developers** Discord server!

---

### Step 2: Configure `.env`
In `Storefornt/discord-bot/`, copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in the values:
```ini
DISCORD_TOKEN=your_bot_token_from_step_1
CLIENT_ID=your_application_id_from_step_1
GUILD_ID=your_discord_server_id
CUSTOMER_ROLE_ID=your_customer_role_id
WELCOME_CHANNEL_ID=your_welcome_channel_id
STORE_URL=https://sbdevelopers.netlify.app
```

> **How to copy IDs in Discord**:
> Enable Developer Mode in Discord (*User Settings -> Advanced -> Developer Mode*).
> Right-click your server icon -> **Copy Server ID** (`GUILD_ID`).
> Right-click your customer role in Server Settings -> Roles -> **Copy Role ID** (`CUSTOMER_ROLE_ID`).
> Right-click your welcome channel -> **Copy Channel ID** (`WELCOME_CHANNEL_ID`).
>
> ⚠️ **Important**: In *Server Settings -> Roles*, drag the **SB Developers Bot** role **above** the Customer role so it has permission to assign it!

---

### Step 3: Run / Host the Bot

#### Option A: Run on your PC or Windows VPS
1. Open PowerShell or Command Prompt inside `Storefornt/discord-bot`:
   ```powershell
   npm install
   npm start
   ```
2. You will see:
   ```
   ===============================================
     SB DEVELOPERS BOT IS ONLINE
     Logged in as: SB Developers Bot#0000
     Serving 1 server(s)
   ===============================================
   [BOT] Successfully reloaded (/) commands.
   ```

#### Option B: Free 24/7 Cloud Hosting (No PC needed)
- **Railway.app** (Recommended):
  1. Push this folder to GitHub or deploy via Railway CLI.
  2. Set Environment Variables in Railway settings from your `.env`.
  3. Start command: `node bot.js`.
- **Render.com** (Free Background Worker).
- **Discloud.com** (Free specialized Discord bot hosting).

---

## 🛠️ Bot Commands
| Command | Description |
|---|---|
| `/store` | Displays featured scripts (SB TDM $13.99) and direct checkout links |
| `/verify` | Claims the Customer role for verified store purchasers |
| `/help` | Shows developer docs, support tickets, and community links |

---

## 🚀 Storefront Discord Login Flow
1. Customer clicks **"Authorize with Discord"** on the storefront.
2. Official Discord OAuth opens asking them to approve access to their identity and avatar.
3. Upon approval, the storefront automatically captures:
   - Discord ID
   - Discord Avatar (DP)
   - Discord Username
4. The storefront displays their profile, opens the invite to `https://discord.gg/JPfmWeqMMC`, and unlocks direct checkout to Tebex!
