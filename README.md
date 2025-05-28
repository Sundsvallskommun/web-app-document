# Sundsvalls kommun - dokumentsökning

## APIer som används

Dessa APIer används i projektet, applikationsanvändaren i WSO2 måste prenumerera på dessa.

| API             | Version |
| --------------- | ------: |
| Party           |     2.0 |
| Document        |     3.0 |

## Utveckling

### Krav

- Node >= 18 LTS
- Yarn

### Steg för steg

1. Klona ner repot.

```
git clone git clone git@github.com:Sundsvallskommun/web-app-document.git
```

2. Installera dependencies för både `backend` och `frontend`

```
cd frontend
yarn install

cd backend
yarn install
```

3. Skapa .env-fil för `frontend`

```
cd frontend
cp .env-example .env
```

Redigera `.env` för behov, för utveckling bör exempelvärdet fungera.

4. Skapa .env-filer för `backend`

```
cd backend
cp .env.example.local .env.development.local
cp .env.example.local .env.test.local
```

redigera `.env.development.local` för behov. URLer, nycklar och cert behöver fyllas i korrekt. Det går att starta tjänsten i två lägen, ett
för att använda oauth2-autentiering mot WSO2 och ett ifall tjänsten ska anropa bakomliggande mikrotjänster direkt. För att använda oauth2 och WSO2
behöver följande properties vara satta:

- `CLIENT_KEY` och `CLIENT_SECRET` måste fyllas i för att APIerna ska fungera, du måste ha en applikation från WSO2-portalen
- `API_BASE_URL` bas-URL för den WSO2-instans som tjänsten ska använda

För att starta tjänsten lokalt och använda lokala instanser av mikrotjänsterna behöver följande properties vara satta:

- `DISABLE_OAUTH2` sätts till true
- `PARTY_API_BASE_URL` sätts till url för party-tjänstens lokala instans (enbart http, https fungerar inte)
- `DOCUMENT_API_BASE_URL` sätts till url för document-tjänstens lokala instans (enbart http, https fungerar inte)

Ifall login guard är aktiverad så behöver följande properties också finnas:

- `SAML_ENTRY_SSO` behöver pekas till en SAML IDP
- `SAML_IDP_PUBLIC_CERT` ska stämma överens med IDPens cert
- `SAML_PRIVATE_KEY` och `SAML_PUBLIC_KEY` behöver bara fyllas i korrekt om man kör mot en riktig IDP
