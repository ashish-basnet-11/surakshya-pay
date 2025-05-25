# surakshya-pay

## Use postgres and redis using docker

```bash
# In root path
docker-compose up -d redis db
```

```bash
digital-wallet/
│
├── frontend/              # React/Next.js or React Native mobile app
│   ├── public/
│   ├── assets/
│   ├── components/
│   ├── screens/           # Mobile views
│   ├── pages/             # Web pages (Next.js)
│   ├── services/          # API calls
│   ├── contexts/          # React Context (auth, wallet, theme)
│   ├── utils/
│   └── app.config.ts      # App configuration
│
├── backend/               # FastAPI or NestJS backend
│   ├── app/
│   │   ├── api/           # Route handlers (REST/GraphQL)
│   │   ├── services/      # Business logic
│   │   ├── models/        # Pydantic / DB schemas
│   │   ├── database/      # PostgreSQL/Redis config
│   │   ├── core/          # Settings, security, JWT, etc.
│   │   ├── ai/            # ML integration (optional)
│   │   └── zkp/           # ZKP proof generation services
│   ├── Dockerfile
│   └── main.py
│
├── blockchain/            # Solidity contracts and deployment scripts
│   ├── contracts/
│   ├── scripts/
│   ├── deployments/
│   ├── test/
│   ├── hardhat.config.js
│   └── package.json
│
├── zkp/                   # Circom or Zokrates circuits and tools
│   ├── circuits/
│   │   ├── age_verification.circom
│   │   ├── transfer_proof.circom
│   ├── input/             # Input JSON for testing
│   ├── build/             # Compiled wasm and keys
│   ├── verifier/          # Smart contract for verifier
│   ├── scripts/           # Compile/generate/verify scripts
│   └── README.md
│
├── ml/                    # AI model code and API integration
│   ├── models/
│   │   ├── fraud_detector.pkl
│   │   ├── expense_classifier.py
│   ├── notebooks/         # Jupyter prototyping
│   ├── service/           # Serve ML via FastAPI or Flask
│   └── train/             # Scripts to train models
│
├── infra/                 # Deployment and infrastructure
│   ├── docker/
│   ├── kubernetes/
│   ├── nginx/
│   └── docker-compose.yml
│
├── docs/                  # Technical docs, API specs, circuit notes
│   ├── architecture.md
│   ├── api.md
│   ├── zkps.md
│   └── ml.md
│
├── .env
├── .gitignore
├── README.md
└── LICENSE
```