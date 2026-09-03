**🚀 Surakshya Pay — Complete Run Guide**  
   
 **Architecture Overview**  
   
 surakshya-pay/  
   
  ├── backend/          → FastAPI (Python)  — Port 8000  
   
  ├── frontend/         → Expo React Native — Port 8081 (mobile) / 19006 (web)  
   
  ├── microservice/  
   
  │   └── zkp-proof-service/ → Node.js ZKP service — Port 5001  
   
  ├── blockchain/       → Hardhat + Solidity smart contracts  
  ├── zkp/              → Circom circuits (pre-compiled)  
   
  └── docker-compose.yml → PostgreSQL (5432) + Redis (6379)  
   
    
   
 **Prerequisites**  
   
 Before starting, make sure the following are installed:  
   
 | | | |  
   
 |-|-|-|  
   
 | **Tool** |  **Version** |  **Install** |  
   
 | Docker & Docker Compose | Latest | [docs.docker.com |  
   
 | Python | ≥ 3.10 | sudo apt install python3 python3-pip python3-venv |  
   
 | Node.js | ≥ 18 | sudo apt install nodejs npm or use nvm |  
   
 | npm | ≥ 9 | Comes with Node.js |  
   
 | snarkjs | Latest | npm install -g snarkjs |  
   
 | Ganache | Latest | Download from ](https://docs.docker.com/get-docker/ "https://docs.docker.com/get-docker/")[trufflesuite.com/ganache |  
   
    
   
 ![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANElEQVR4nO3OQQmAABRAsad4EkMY9ecwnkms4E2ELcGWmTmrKwAA/uLeqrU6vp4AAPDa/gDzXAM6/j8dDQAAAABJRU5ErkJggg==)  
   
 **Step 1 — Start Infrastructure (PostgreSQL + Redis)**](https://archive.trufflesuite.com/ganache/ "https://archive.trufflesuite.com/ganache/")  
**From the project root**  
 cd /home/ashish/Documents/surakshya-pay  
   
    
   
  docker-compose up -d redis db  
   
    
   
 Verify they're running:  
   
 docker ps  
   
  # Should show: redis (port 6379) and postgres (port 5432)  
   
    
   
 ![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OQQmAABRAsSd4tIGdjCS/pwGsYQVvImwJtszMXp0BAPAX91pt1fH1BACA164HhYgEO/4GtLAAAAAASUVORK5CYII=)  
   
 **Step 2 — Set Up the Backend (FastAPI)**  
   
 **2a. Create & activate a virtual environment**  
   
 cd /home/ashish/Documents/surakshya-pay/backend  
   
    
   
  python3 -m venv venv  
   
  source venv/bin/activate  
   
    
   
 **2b. Install dependencies**  
   
 pip install -r requirements.txt  
   
    
   
 **2c. Create the .env file**  
   
 The .env file has already been created for you at backend/.env.  
   
    
   
  Open it and **update the email credentials** with your real SMTP details:  
   
 nano .env  
   
  # Update: MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM  
   
    
   
 ***💡 Gmail tip:*** * Use an App Password (not your account password).*  
   
  *  
   
  Go to: Google Account → Security → 2-Step Verification → App Passwords*  
   
 **2d. Run database migrations**  
   
 The app auto-creates tables on startup via SQLAlchemy (create_all).  
   
    
   
  No manual migration needed for a fresh setup. ✅  
   
 **2e. Start the backend server**  
**From backend/ with venv active**  
 uvicorn main:app --host 0.0.0.0 --port 8000 --reload  
   
    
   
 The API will be live at: http://localhost:8000  
   
    
   
  Interactive docs at: http://localhost:8000/docs  
   
 ![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OQQmAABRAsSd4NoCpTCQ/pwmMYQVvImwJtszMXp0BAPAX91pt1fH1BACA164HosMEPiBLnfkAAAAASUVORK5CYII=)  
   
 **Step 3 — Start the ZKP Proof Microservice**  
   
 *[!IMPORTANT]*  
   
  *  
   
  The backend's login flow calls this service to verify ZKP proofs.*  
   
  *  
   
  * ***This must be running before you log in.***  
   
 cd /home/ashish/Documents/surakshya-pay/microservice/zkp-proof-service  
   
    
   
  npm install  
   
  node server.js  
   
    
   
 The ZKP service will run at: http://localhost:5001  
   
 *[!NOTE]*  
   
  *  
   
  The service uses pre-compiled Circom WASM files in * *circuits/*  *.*  
   
  *  
   
  Ensure * *circuits/auth.wasm* *, *  *circuits/auth_final.zkey*  *, and * * *circuits/verification_key.json* * * exist.*  
   
  *  
   
  If they're missing, you'll need to recompile from * *zkp/authentication/*  *.*  
   
 ![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANElEQVR4nO3OQQmAABRAsad4EFMY9fewnUms4E2ELcGWmTmrKwAA/uLeqrU6vp4AAPDa/gDzYgM3ZPdzEgAAAABJRU5ErkJggg==)  
   
 **Step 4 — Set Up and Start Ganache (Blockchain)**  
   
 **4a. Launch Ganache**  
- Open **Ganache** desktop app  
- Create a new **Ethereum** workspace  
- Ensure it's running on http://127.0.0.1:7545 (default)  
- Note the **first account's private key** (used as FUNDER_PRIVATE_KEY)  
 **4b. Deploy Smart Contracts**  
   
 cd /home/ashish/Documents/surakshya-pay/blockchain  
   
    
   
  npm install  
   
    
   
  # Compile contracts  
   
  npx hardhat compile  
   
    
   
  # Deploy to local Ganache  
   
  npx hardhat run ignition/modules/ --network ganache  
   
  # or use the ignition deploy command:  
   
  npx hardhat ignition deploy --network ganache  
   
    
 *[!IMPORTANT]*  
   
  *  
   
  After deployment, copy the deployed * ***contract address*** * and update *  *CONTRACT_ADDRESS* * in *  *backend/.env* *.*  
   
  *  
   
  Also update * *FUNDER_PRIVATE_KEY* * with the Ganache account private key.*  
 ![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNBCkJfEnKYmFDBhAU2QtIq6DIzW7UHAMBfnGt1V8fXEwAAXrse/xMF7vZtYGoAAAAASUVORK5CYII=)  
 **Step 5 — Start the Frontend (Expo React Native)**  
 **5a. Install dependencies**  
   
 cd /home/ashish/Documents/surakshya-pay/frontend  
   
    
   
  npm install  
   
    
 **5b. Update the API base URL**  
   
 Open frontend/config/api.ts and change the baseURL to your machine's **local IP** (not localhost, because the mobile device/emulator needs to reach your machine):  
**Find your local IP**  
 ip addr show | grep "inet " | grep -v 127.0.0.1  
   
    
   
 Then edit config/api.ts:  
   
 baseURL: "http://<YOUR_LOCAL_IP>:8000/api/v1",  
   
    
   
 **5c. Start the Expo dev server**  
   
 npm start  
   
  # or for web:  
   
  npm run web  
   
    
   
 You'll see a QR code. Use the **Expo Go** app on your phone to scan it, or press:  
- w → Open in browser  
- a → Open Android emulator  
- i → Open iOS simulator  
 ![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OQQmAABRAsScYxpg/jzVsYQKvNrCCNxG2BFtmZquOAAD4i3Ot7mr/egIAwGvXA4D+Bc7pl4pfAAAAAElFTkSuQmCC)  
 **Quick Reference — All Services at a Glance**  
   
 | | | |  
   
 |-|-|-|  
   
 | **Service** |  **Command** |  **Port** |  
   
 | PostgreSQL | docker-compose up -d db | 5432 |  
   
 | Redis | docker-compose up -d redis | 6379 |  
   
 | Backend (FastAPI) | uvicorn main:app --reload | 8000 |  
   
 | ZKP Microservice | node server.js | 5001 |  
   
 | Ganache (Blockchain) | GUI App | 7545 |  
   
 | Frontend (Expo) | npm start | 8081 / 19006 |  
   
    
 ![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AUBBAsUeCFISeISz9CRVMWGAjJK2CbjNzVGcAAPzF2qu7Wl9PAAB47XoA/vsF8SxXdngAAAAASUVORK5CYII=)  
 **Recommended Startup Order**  
1. docker-compose up -d redis db    ← Infrastructure first  
   
  2. uvicorn main:app --reload         ← Backend  
   
  3. node server.js                    ← ZKP service (needed for login)  
   
  4. Ganache GUI                       ← Blockchain  
   
  5. npm start (in frontend/)          ← Frontend last  
   
    
 ![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANElEQVR4nO3OQQmAABRAsad4EkMY9ecwnkms4E2ELcGWmTmrKwAA/uLeqrU6vp4AAPDa/gDzXAM6/j8dDQAAAABJRU5ErkJggg==)  
 **Troubleshooting**  
   
 **❌ * ***psycopg2 ** connection error***  
 *  
 Make sure PostgreSQL Docker container is running and .env credentials match:*  
 *  
 docker ps | grep postgres*  
 *  
  *  
 *  
 * ***❌ ZKP verification fails on login***  
 *  
 The microservice/zkp-proof-service is not running. Start it with node server.js.*  
 *  
 * ***❌ Frontend shows blank screen / can't connect***  
 *  
 The baseURL in frontend/config/api.ts must use your machine's * ***LAN IP*** *, not localhost.*  
 *  
 * ***❌ Contract address mismatch***  
 *  
 After redeploying, update CONTRACT_ADDRESS in backend/.env and restart the backend.*  
 *  
 * ***❌ Email OTP not sending***  
 *  
 Check your Gmail App Password setup. Make sure MAIL_* variables in .env are correct.  
   
    
   
 Backend: uvicorn main:app --host 0.0.0.0 --port 8000 --reload  
   
 microservice/zkp-proof: node server.js  
   
    
