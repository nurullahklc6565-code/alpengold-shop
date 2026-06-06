# Stripe Test Kurulum Kılavuzu

## 1. .env.local Dosyasını Hazırla

Projenin kökünde `.env.local` oluştur (git'e commit edilmez):

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
STRIPE_SUCCESS_URL=http://localhost:3002/checkout/success
STRIPE_CANCEL_URL=http://localhost:3002/checkout/cancel
```

> **Önemli:** `STRIPE_WEBHOOK_SECRET` tanımlanmazsa Stripe aktif olmaz —
> sistemimiz webhook imzasını doğrulayamadan siparişi PAID yapmaz.

## 2. Stripe Dashboard'dan Anahtarları Al

1. https://dashboard.stripe.com adresine giriş yap
2. **Developers → API keys** bölümüne git
3. Test modu aktifken:
   - `Publishable key` (pk_test_...) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `Secret key` (sk_test_...) → `STRIPE_SECRET_KEY`

## 3. Stripe CLI ile Local Webhook Test

### Stripe CLI Kur (macOS)

```bash
brew install stripe/stripe-cli/stripe
```

### Giriş Yap

```bash
stripe login
```

Tarayıcıda authorize et.

### Webhook'ları Local'e Yönlendir

```bash
stripe listen --forward-to localhost:3002/api/webhooks/stripe
```

Bu komut çalıştığında terminalde şunu göreceksin:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxx (^C to quit)
```

`whsec_xxxxxxxx` değerini `.env.local` dosyasına `STRIPE_WEBHOOK_SECRET` olarak kopyala.
Sunucuyu yeniden başlat:

```bash
npm run dev
```

## 4. Test Ödemesi Yap

Stripe test kartı:
- **Kart numarası:** `4242 4242 4242 4242`
- **Son kullanma:** Herhangi bir gelecek tarih (örn. `12/34`)
- **CVC:** Herhangi 3 rakam (örn. `123`)
- **İsim:** Herhangi bir isim

### Reddedilen kart testi:
- **Kart numarası:** `4000 0000 0000 0002` (her zaman reddedilir)

## 5. Akış Özeti

```
Müşteri checkout → Sipariş oluştur (UNPAID/PENDING)
    → /checkout/payment/[orderId] → Stripe Checkout Session oluştur
    → Stripe hosted payment page (test kartı gir)
    → Başarılı: Stripe → webhook → /api/webhooks/stripe → sipariş PAID
    → Stripe → kullanıcıyı /checkout/success/[orderId] sayfasına yönlendir
    → İptal: Stripe → /checkout/cancel?orderId=... sayfasına yönlendir
```

## 6. Desteklenen Webhook Event'leri

| Event | Sonuç |
|-------|-------|
| `checkout.session.completed` | Sipariş → PAID, stok düşürülür, e-posta gönderilir |
| `payment_intent.succeeded` | Idempotent (checkout.session.completed ile aynı, yinelenirse atlanır) |
| `payment_intent.payment_failed` | Sipariş UNPAID kalır, stok rezervasyonu serbest bırakılır |
| `payment_intent.canceled` | Sipariş UNPAID kalır, stok rezervasyonu serbest bırakılır |
| `charge.refunded` (tam) | Sipariş → REFUNDED |
| `charge.refunded` (kısmi) | Sipariş → PARTIALLY_PAID |

## 7. Güvenlik Notları

- `STRIPE_SECRET_KEY` asla frontend'e gitmez (`NEXT_PUBLIC_` prefix'i yok)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` güvenli olarak frontend'de kullanılabilir
- `STRIPE_WEBHOOK_SECRET` tanımlanmadan hiçbir sipariş PAID yapılmaz
- Webhook endpoint imza doğrulaması zorunlu — sahte webhook geçemez
- Sipariş tutarı yalnızca sunucu tarafı DB'den okunur (URL manipülasyonuna dayanmaz)
