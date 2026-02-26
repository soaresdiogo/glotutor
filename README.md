This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Production requirements

For **Prática de fala** (Speaking practice) and **Reading** (pronunciation assessment), the server must have **ffmpeg** available so that browser audio (e.g. webm) can be converted to WAV for Azure Speech. If ffmpeg is missing, those endpoints return **503** with `SPEECH_PROCESSING_UNAVAILABLE`.

### Coolify (VPS Hostinger, etc.)

Use the **Dockerfile** do repositório: ele já instala ffmpeg na imagem.

1. No Coolify, no recurso da aplicação: **Build Pack** → escolha **Dockerfile**.
2. **Dockerfile location:** deixe o padrão (ex.: `Dockerfile` na raiz) ou `./Dockerfile`.
3. Faça um novo deploy (Build & Redeploy). A imagem passará a incluir ffmpeg e o envio de áudio na Prática de fala deve funcionar.

### Outros ambientes

- **Docker manual:** use o `Dockerfile` do projeto (já inclui ffmpeg) ou adicione no seu Dockerfile: `RUN apt-get update && apt-get install -y ffmpeg`
- **Sistema / PaaS sem Dockerfile:** garanta que o binário `ffmpeg` esteja no PATH ou que o pacote npm `ffmpeg-static` resolva o binário na sua plataforma.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
