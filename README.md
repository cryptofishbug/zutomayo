# ZUTOMAYO Popup Browser

`zutomayo_md_list.csv`에 있는 상품만 골라 `https://zutomayomart.net/` 상세 페이지의 이미지와 정보를 정리하는 정적 웹사이트입니다.

## Stack

- Vite
- React
- TypeScript
- Node crawler (`cheerio`, `csv-parse`)

## Run

```bash
npm install
npm run refresh-data
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

`.github/workflows/deploy.yml`가 `main` 브랜치 푸시 시 GitHub Pages로 배포합니다.
