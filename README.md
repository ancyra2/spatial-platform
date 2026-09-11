# Spatial platform

Konum ve kamera odaklı, fiziksel mekanlara dijital bilgi ve iz bırakmayı hedefleyen platformun proje temeli. Bu aşamada ürün özelliği, kullanıcı modeli, harita veya AR implementasyonu yoktur.

**Common by default, native when necessary.** Tek Angular kod tabanı Web/PWA ve ileride Capacitor Android/iOS için kullanılır. Backend REST modular monolith'tir. Ayrıntılar: [architecture](docs/architecture.md), [agent kuralları](AGENTS.md).

## Stack ve gereksinimler

- Node.js **24.13.0**, Node 24 LTS; `.nvmrc` ve `engines` ile belirtilir.
- pnpm **11.19.0**; `packageManager` sabittir, `pnpm-lock.yaml` commit edilir. Güncellemelerde bu alanlar birlikte değiştirilir.
- Nx ve bütün `@nx/*` paketleri **23.2.1**.
- Angular **22.1.6**, Angular CLI/build **22.1.7**, TypeScript **6.0.3**.
- NestJS **11.2.3**, Prisma/client/adapter **7.10.0** stable, Capacitor core/CLI **8.5.1**.
- Docker Desktop/Engine, Compose v2 (`--wait` desteği), Git.
- PostgreSQL/PostGIS ve Redis için Compose dosyasındaki digest ile sabitlenmiş stable image'lar.

Angular 22 TypeScript 6.0 ister; rastgele TypeScript latest güncellemesi yapmayın. Prisma 8 RC kullanılmaz. Android/iOS SDK'ları bu görev için gerekmez.

## Kurulum

Node 24.13.0 kurun/seçin. pnpm yoksa `npm install --global pnpm@11.19.0` kullanın.

```sh
pnpm install --frozen-lockfile
```

`.env.example` dosyasını `.env` olarak kopyalayın (PowerShell: `Copy-Item .env.example .env`; POSIX: `cp .env.example .env`). Placeholder parolaları değiştirin ve bağlantı URL'lerini aynı değerlere göre düzenleyin. Gerçek secret commit etmeyin.

```sh
docker compose config --quiet
pnpm infra:up
pnpm db:generate
pnpm db:deploy
```

`infra:up`, PostgreSQL ve Redis sağlıklı olana kadar bekler. API/web host üzerinde çalışır. Varsayılan 5432 veya 6379 portları doluysa `.env` içindeki portları ve DATABASE_URL/REDIS_URL adreslerini birlikte değiştirin. İlk yerel doğrulamada mevcut servislere dokunmamak için 55432/56379 kullanıldı; commit edilen örnek standart portları kullanır.

Ayrı terminallerde, repository root'undan:

```sh
pnpm api
pnpm web
```

Web: [localhost:4200](http://localhost:4200). API: [health](http://127.0.0.1:3000/api/v1/health), [readiness](http://127.0.0.1:3000/api/v1/health/ready), [Swagger](http://127.0.0.1:3000/api/v1/docs).

Nest `.env` dosyasını yükler. Angular development proxy'si varsayılan `http://127.0.0.1:3000` hedefini kullanır. API portunu değiştirirseniz web terminalinde `API_PROXY_URL` ayarlayın (PowerShell: `$env:API_PROXY_URL='http://127.0.0.1:3001'`; POSIX: `API_PROXY_URL=http://127.0.0.1:3001 pnpm web`). Proxy için kök `.env` otomatik yüklenmez.

## Environment

| Değişken                                      | Kullanım                                                                    |
| --------------------------------------------- | --------------------------------------------------------------------------- |
| NODE_ENV                                      | development / test / production                                             |
| API_HOST, API_PORT                            | API bind adresi ve portu; varsayılan 127.0.0.1:3000                         |
| CORS_ORIGINS                                  | Virgülle ayrılmış tam origin'ler; wildcard/path yok, production HTTPS ister |
| SWAGGER_ENABLED                               | true/false; production varsayılan false                                     |
| API_PROXY_URL                                 | Web dev-server process environment'ında proxy hedefi                        |
| POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB | Yerel Compose DB kurulumu                                                   |
| POSTGRES_PORT                                 | Host PostgreSQL portu                                                       |
| DATABASE_URL                                  | Prisma/Nest URL; özel parola karakterleri URL-encoded olmalı                |
| REDIS_PORT, REDIS_PASSWORD                    | Yerel Compose Redis bağlantısı                                              |
| REDIS_URL                                     | Doğrulanan gelecek Redis config'i; henüz client bağlantısı yok              |

Frontend yalnız public build config kullanır: `apps/web/src/environments/`, injection token `APP_CONFIG`. Production `/api/v1` aynı origin hosting varsayar; deployment ortamı bu yönlendirmeyi sağlamalı veya public API URL değiştirilmelidir. Native platform eklenmeden önce HTTPS API URL yapılandırılmalıdır. Frontend dosyalarına secret koymayın.

## Kalite ve Nx

```sh
pnpm format
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm graph
pnpm exec nx show projects
pnpm exec nx show project web
pnpm exec nx show project api
pnpm exec nx graph --file=dist/project-graph.json
pnpm exec nx affected -t lint test build --base=main
```

`affected` karşılaştırılabilir bir main ref'i gerektirir; CI tüm projeleri doğrular. Root script'ler Nx hedef çıkarımından dışlanmıştır; tekrar kendilerini çağırmazlar. Nx cache `.nx/`, çıktılar `dist/` altında tutulur. API build/test/typecheck öncesi Prisma client otomatik üretilir. Contracts saf type tanımlarıdır; runtime testi yerine strict compile kontrolü kullanılır.

GitHub Actions PR ve main push'larında frozen install, format, Prisma validate, lint, typecheck, test ve build çalıştırır. pnpm store ve Nx cache kullanılır. Workflow deploy, image publish veya cloud kaynağı oluşturmaz. DB entegrasyonu yerel Docker smoke testiyle ayrıca doğrulanır; unit/HTTP testleri DB gerektirmez.

## Database ve infrastructure işlemleri

```sh
pnpm db:validate
pnpm db:generate
pnpm db:deploy
pnpm db:migrate --name meaningful_change
pnpm db:studio
docker compose ps
docker compose logs postgres redis
pnpm infra:down
```

`db:deploy` mevcut migration'ları uygular; ilk migration PostGIS extension'ını idempotent etkinleştirir. `db:migrate` yalnız gerçek schema değişikliği tasarlandığında yeni development migration üretmek içindir; ardından `db:generate` çalıştırın. Modelsiz schema bu foundation için yeterlidir; Studio'da ürün tablosu bulunmaması normaldir. PostgreSQL named volume `infra:down` ile korunur. Volume silme veri kaybıdır; varsayılan komutlara eklenmemiştir.

Process health DB sorgulamaz. Readiness gerçek Prisma/PostgreSQL bağlantısı ve `postgis_version()` kontrol eder. Spatial SQL ileride domain data-access/repository sınırında kalır. Redis yalnız altyapıdır; cache/queue/worker kurulmamıştır.

## PWA ve Capacitor

Production build manifest, 192/512 PNG placeholder ikonları ve Angular service worker üretir. Development ve native runtime'da service worker kapalıdır. Yalnız statik shell cache edilir; API data cache, offline sync ve background sync yoktur.

```sh
pnpm exec nx serve-static web --port=4300
```

[localhost:4300](http://localhost:4300) üzerinden production PWA'yı inceleyin; localhost dışındaki ortamlarda HTTPS gerekir. DevTools Application sekmesinde manifest/service worker kontrol edilir. İsim ve ikonlar geçicidir; gerçek marka tasarımı yapılmadı.

Capacitor config yalnız `dist/apps/web/browser` output'unu tanımlar. **TODO: nihai uygulama adı, Android package ID, iOS bundle ID.** Kimlikler kararlaştırılana kadar `cap add/sync` çalıştırmayın. `android/` ve `ios/` klasörleri yoktur.

ARCore/ARKit, VPS ve native spatial anchors ileride custom Capacitor plugin ile Kotlin/Swift tarafında uygulanır. Angular business kodu typed platform-neutral adapter ile konuşur; native detaylar bu sınıra sızmaz. Ionic veya ağır UI framework yoktur.

## AI stratejisi

AI projenin planlanan bir parçasıdır. Mimari akış: Angular → NestJS domain endpoint'i → domain servisi → AI sağlayıcı adaptörü. API anahtarları ve sağlayıcı SDK'ları backend'de kalır; ortak kontratlar yalnız uygulamaya ait veri tiplerini taşır.

İlk kullanım senaryosu seçildiğinde ilgili domain içinde çalışan entegrasyon eklenecek. Sağlayıcı/model seçimi, çıktı doğrulaması, kullanım/maliyet sınırları, timeout ve hata davranışı, veri gizliliği ve değerlendirme testleri o özelliğin parçası olacak. Cihaz üzerinde AI veya Computer Vision gerektiğinde native detaylar Capacitor plugin sınırında tutulacak.

Şu anda AI SDK'sı, endpoint'i, boş AI library'si veya yeni environment değişkeni eklenmedi. Ayrıntılar: [planlanan AI mimarisi](docs/architecture.md#ai-integration-strategy-planned).

## Dizinler

```text
apps/
  web/                 Angular shell, routes, PWA
  api/                 Nest HTTP/config/health/database + Prisma
libs/shared/
  contracts/           Pure TypeScript HTTP shapes
  util/                Pure helpers with real consumers
docs/architecture.md
.github/workflows/ci.yml
AGENTS.md
compose.yaml
prisma.config.ts
capacitor.config.ts
```

Bir sonraki adım, ilk ürün akışının kapsamını ve domain sınırlarını tasarlamaktır; auth, harita, spatial traces veya AR bu foundation'ın parçası değildir.
