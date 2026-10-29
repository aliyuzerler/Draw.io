# Yapay zekâ sağlayıcıları

Next AI Draw.io'yu kendiniz barındırdığınızda, ortam değişkenleri yapay zekâ sağlayıcısını ve modeli seçer. Bu sayfa, her sağlayıcının değişkenlerini, tüm kullanıcılara birkaç modeli nasıl sunacağınızı ve koda yeni bir sağlayıcıyı nasıl ekleyeceğinizi gösterir.

## Başlayın

1. `env.example` dosyasını `.env.local`e kopyalayın.
2. Seçtiğiniz sağlayıcının API anahtarını ayarlayın.
3. `AI_MODEL`i istediğiniz modele ayarlayın.
4. `npm run dev` çalıştırın.

## Her sağlayıcıyı kurma

### OpenAI

```bash
OPENAI_API_KEY=your_api_key
AI_MODEL=gpt-4o
```

İsteğe bağlı olarak, OpenAI uyumlu bir hizmet için özel bir uç nokta ayarlayın:

```bash
OPENAI_BASE_URL=https://your-custom-endpoint/v1
```

LM Studio ve diğer yerel OpenAI uyumlu sunucular da aynı biçimde çalışır. Taban URL'yi `http://localhost:1234/v1`e (LM Studio'nun varsayılan portu) ayarlayın ve `lm-studio` gibi boş olmayan herhangi bir API anahtarı kullanın. Bu, yukarıdaki ortam değişkenleriyle ve Ayarlar'ın Modeller sekmesinde çalışır.

### Anthropic

```bash
ANTHROPIC_API_KEY=your_api_key
AI_MODEL=claude-sonnet-4-5-20250929
```

Bir Bearer token ile de oturum açabilirsiniz; örneğin OAuth tarzı token veren bir ağ geçidinden geçerken:

```bash
ANTHROPIC_AUTH_TOKEN=your_auth_token
AI_MODEL=claude-sonnet-4-5-20250929
```

`ANTHROPIC_API_KEY`, `x-api-key` başlığı olarak gönderilir; `ANTHROPIC_AUTH_TOKEN`, `Authorization: Bearer <token>` olarak. İkisi birlikte kullanılamaz; yalnızca birini ayarlayın.

İsteğe bağlı olarak özel bir uç nokta ayarlayın:

```bash
ANTHROPIC_BASE_URL=https://your-custom-endpoint
```

### Google Gemini

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key
AI_MODEL=gemini-2.0-flash
```

İsteğe bağlı olarak özel bir uç nokta ayarlayın:

```bash
GOOGLE_BASE_URL=https://your-custom-endpoint
```

### DeepSeek

```bash
DEEPSEEK_API_KEY=your_api_key
AI_MODEL=deepseek-chat
```

İsteğe bağlı olarak özel bir uç nokta ayarlayın:

```bash
DEEPSEEK_BASE_URL=https://your-custom-endpoint
```

### Qwen (Alibaba Cloud)

```bash
QWEN_API_KEY=your_api_key
AI_MODEL=qwen-turbo
```

İsteğe bağlı olarak özel bir uç nokta ayarlayın:

```bash
QWEN_BASE_URL=https://your-custom-endpoint
```

### Doubao (ByteDance Volcengine)

```bash
DOUBAO_API_KEY=your_api_key
AI_MODEL=doubao-seed-1-8-251228  # or other Doubao model
```

### GLM (Zhipu AI)

```bash
GLM_API_KEY=your_api_key
AI_MODEL=glm-4
```

İsteğe bağlı olarak özel bir uç nokta ayarlayın:

```bash
GLM_BASE_URL=https://your-custom-endpoint
```

### Kimi (Moonshot AI)

```bash
KIMI_API_KEY=your_api_key
AI_MODEL=kimi-latest
```

İsteğe bağlı olarak özel bir uç nokta ayarlayın:

```bash
KIMI_BASE_URL=https://your-custom-endpoint
```

### MiniMax

MiniMax iki API biçimini destekler:

| Biçim | Uç nokta | Notlar |
|---|---|---|
| Anthropic uyumlu | `/anthropic` | Önerilir. Araya giren düşünmeyi (interleaved thinking) destekler; model araç çağrıları arasında düşünebilir |
| OpenAI uyumlu | `/v1` | Standart OpenAI chat completions biçimi |

```bash
MINIMAX_API_KEY=your_api_key
AI_MODEL=MiniMax-M3
```

İsteğe bağlı ayarlar:

```bash
# Çin anakarası, Anthropic uyumlu (varsayılan)
MINIMAX_BASE_URL=https://api.minimaxi.com/anthropic

# Çin anakarası, OpenAI uyumlu
MINIMAX_BASE_URL=https://api.minimaxi.com/v1

# Uluslararası, Anthropic uyumlu
MINIMAX_BASE_URL=https://api.minimax.io/anthropic

# Uluslararası, OpenAI uyumlu
MINIMAX_BASE_URL=https://api.minimax.io/v1
```

### MiMo (Xiaomi)

```bash
MIMO_API_KEY=your_api_key
AI_MODEL=mimo-v2.5-pro
```

İsteğe bağlı olarak özel bir uç nokta ayarlayın. Token Plan aboneleri, kendilerine özel taban URL'yi ayarlamalıdır:

```bash
MIMO_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1
```

### OpenRouter

```bash
OPENROUTER_API_KEY=your_api_key
AI_MODEL=anthropic/claude-sonnet-4
```

İsteğe bağlı olarak özel bir uç nokta ayarlayın:

```bash
OPENROUTER_BASE_URL=https://your-custom-endpoint
```

### AIHubMix

AIHubMix, tek bir API anahtarıyla Claude, GPT, Gemini, DeepSeek ve diğer modelleri verir.

```bash
AIHUBMIX_API_KEY=your_api_key
AI_MODEL=claude-sonnet-4-5-20250929
```

İsteğe bağlı olarak özel bir uç nokta ayarlayın:

```bash
AIHUBMIX_BASE_URL=https://aihubmix.com/v1
```

### SiliconFlow (OpenAI uyumlu)

```bash
SILICONFLOW_API_KEY=your_api_key
AI_MODEL=deepseek-ai/DeepSeek-V3  # example; use any SiliconFlow model id
```

Taban URL olmadan uygulama, `https://api.siliconflow.cn/v1`yi — cloud.siliconflow.cn'den gelen anahtarlar için uç noktayı — kullanır. Anahtarınız uluslararası siteden, cloud.siliconflow.com'dan geldiyse .com uç noktasını ayarlayın:

```bash
SILICONFLOW_BASE_URL=https://api.siliconflow.com/v1
```

### ModelScope

```bash
MODELSCOPE_API_KEY=your_api_key
AI_MODEL=Qwen/Qwen3-235B-A22B-Instruct-2507
```

İsteğe bağlı olarak özel bir uç nokta ayarlayın:

```bash
MODELSCOPE_BASE_URL=https://your-custom-endpoint
```

### Novita AI

```bash
NOVITA_API_KEY=your_api_key
AI_MODEL=deepseek/deepseek-v4-pro
```

İsteğe bağlı olarak özel bir uç nokta ayarlayın. Ayarlanmazsa `https://api.novita.ai/openai` kullanılır:

```bash
NOVITA_BASE_URL=https://your-custom-endpoint
```

### Atlas Cloud

```bash
ATLASCLOUD_API_KEY=your_api_key
AI_MODEL=your_model_id
```

Uygulamada Atlas Cloud için yerleşik bir model listesi yoktur. Ayarlar'ın Modeller sekmesinde, listeyi anahtarınızla Atlas Cloud'dan yükler.

İsteğe bağlı olarak özel bir uç nokta ayarlayın. Ayarlanmazsa `https://api.atlascloud.ai/v1` kullanılır:

```bash
ATLASCLOUD_BASE_URL=https://your-custom-endpoint
```

### Qiniu (Qiniu Cloud)

```bash
QINIU_API_KEY=your_api_key
AI_MODEL=your_model_id
```

İsteğe bağlı olarak özel bir uç nokta ayarlayın:

```bash
QINIU_BASE_URL=https://your-custom-endpoint
```

### Vercel AI Gateway

Vercel AI Gateway, birçok yapay zekâ sağlayıcısını tek bir API anahtarıyla verir. Oturum açması daha basittir ve birkaç API anahtarı yönetmeden sağlayıcı değiştirebilirsiniz.

Vercel'in barındırdığı ağ geçidiyle:

```bash
AI_GATEWAY_API_KEY=your_gateway_api_key
AI_MODEL=openai/gpt-4o
```

Özel bir ağ geçidi adresiyle — yerel geliştirme ya da kendi barındırdığınız bir ağ geçidi için:

```bash
AI_GATEWAY_API_KEY=your_custom_api_key
AI_GATEWAY_BASE_URL=https://your-custom-gateway.com/v1/ai
AI_MODEL=openai/gpt-4o
```

Model kimlikleri `provider/model` biçimindedir:

| `AI_MODEL` | Model |
|---|---|
| `openai/gpt-4o` | OpenAI GPT-4o |
| `anthropic/claude-sonnet-4-5` | Anthropic Claude Sonnet 4.5 |
| `google/gemini-2.0-flash` | Google Gemini 2.0 Flash |

`AI_GATEWAY_BASE_URL` ayarlanmazsa varsayılan Vercel Gateway adresi (`https://ai-gateway.vercel.sh/v1/ai`) kullanılır. Özel bir taban URL şunlar için faydalıdır:

- Kendi Gateway örneğinizle yerel geliştirme
- Kendi barındırdığınız AI Gateway dağıtımları
- Kurumsal vekil kurulumları

Özel bir taban URL kullandığınızda `AI_GATEWAY_API_KEY`i de ayarlamanız gerekir.

API anahtarınızı [Vercel AI Gateway panosundan](https://vercel.com/ai-gateway) alın.

### Amazon Bedrock

```bash
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AI_MODEL=global.anthropic.claude-sonnet-5-5
```

Yeni Claude modelleri yalnızca bir çıkarım profili kimliği (inference profile id) ile yanıt verir. Bu kimlik, `global.` ya da `us.` gibi bir bölge önekiyle başlar. Düz kimlik (`anthropic.claude-sonnet-5-5`), "on-demand throughput isn't supported" hatasıyla başarısız olur.

AWS üzerinde (Lambda ya da IAM rolü olan bir EC2), kimlik bilgileri IAM rolünden otomatik gelir.

### Google Vertex AI

Google Vertex AI, Google Cloud'un kurumsal hizmetidir; kurumsal özellikler ve veri kalıcılığı (veriniz seçtiğiniz bölgede kalır) sunar. Express Mode düz bir API anahtarıyla oturum açar; dolayısıyla Vercel ve Cloudflare gibi uç (edge) çalışma zamanlarında da çalışır.

```bash
GOOGLE_VERTEX_API_KEY=your_api_key
AI_MODEL=gemini-2.0-flash
```

İsteğe bağlı olarak özel bir uç nokta ayarlayın:

```bash
GOOGLE_VERTEX_BASE_URL=https://your-custom-endpoint
```

### Azure OpenAI

Azure, ya kaynak adınızı ya da uç nokta adresinizi ister. İkisinden birini ayarlayın. İkisini de ayarlarsanız `AZURE_BASE_URL` kullanılır.

Kaynak adıyla:

```bash
AZURE_API_KEY=your_api_key
AZURE_RESOURCE_NAME=your-resource-name  # Your Azure resource name
AI_MODEL=your-deployment-name
```

Ya da kaynak adı yerine uç nokta adresiyle:

```bash
AZURE_API_KEY=your_api_key
AZURE_BASE_URL=https://your-resource.openai.azure.com/openai  # In place of AZURE_RESOURCE_NAME
AI_MODEL=your-deployment-name
```

İsteğe bağlı olarak akıl yürütme seçeneklerini ayarlayın:

```bash
AZURE_REASONING_EFFORT=low      # Optional: low, medium, high
AZURE_REASONING_SUMMARY=detailed  # Optional: none, brief, detailed
```

### EdgeOne Pages (Tencent Cloud)

Uygulamayı Tencent EdgeOne Pages'e daıttığınızda, sitenin `/api/edgeai` yolundaki kendi Edge AI işlevini kullanabilir. Bunun için ne API anahtarı ne taban URL gerekir. Algılanacak bir anahtar olmadığından sunucu bu sağlayıcıyı kendisi seçemez; o yüzden `AI_PROVIDER`ı ayarlayın:

```bash
AI_PROVIDER=edgeone
AI_MODEL=@tx/deepseek-ai/deepseek-v32
```

İşlev, `@tx/deepseek-ai/deepseek-v32`, `@tx/deepseek-ai/deepseek-r1-0528` ve `@tx/deepseek-ai/deepseek-v3-0324` kabul eder. `ACCESS_CODE_LIST` ayarlarsanız işlev erişim kodunu da denetler.

### Ollama (yerel)

```bash
AI_PROVIDER=ollama
AI_MODEL=llama3.2
```

İsteğe bağlı olarak özel bir adres ayarlayın:

```bash
OLLAMA_BASE_URL=http://localhost:11434/api
```

### SGLang

```bash
SGLANG_API_KEY=your_api_key
AI_MODEL=your_model_id
```

İsteğe bağlı olarak özel bir uç nokta ayarlayın:

```bash
SGLANG_BASE_URL=https://your-custom-endpoint/v1
```

### Diğer herhangi bir OpenAI uyumlu API (özel)

Yukarıda listelenmemiş bir sunucu için — örneğin vLLM, LM Studio, LiteLLM ya da bir API ağ geçidi — Ayarlar'da OpenAI uyumlu'yu seçin ve taban adresini ile bir anahtarını girin. Sunucu anahtarları yok sayıyorsa boş olmayan herhangi bir değer çalışır.

Uygulama, birkaç sistem iletisini tekil birleştirir — açık kaynak sohbet şablonlarının beklediği gibi — ve `<think>` akıl yürütmesini yanıttan ayırır.

```bash
CUSTOM_API_KEY=your_api_key
CUSTOM_BASE_URL=http://127.0.0.1:8000/v1
AI_MODEL=your_model_id
```

## Sunucu sağlayıcıyı nasıl seçer

Yalnızca bir sağlayıcının API anahtarını ayarladıysanız sunucu o sağlayıcıyı algılar ve onu kullanır. `AI_PROVIDER`ı ayarlamanız gerekmez.

Birkaç sağlayıcı için API anahtarı ayarladıysanız `AI_PROVIDER`ı ayarlamanız gerekir:

```bash
AI_PROVIDER=google  # or: openai, anthropic, google, vertexai, azure, bedrock, ollama, openrouter, aihubmix, deepseek, siliconflow, sglang, gateway, edgeone, doubao, modelscope, glm, qwen, qiniu, kimi, minimax, novita, mimo, atlascloud, custom
```

## Tüm kullanıcılara birkaç model sunma

Bir yönetici olarak sunucuda birkaç model kurabilirsiniz. Tüm kullanıcılar sonra onları kendi API anahtarı olmadan kullanabilir. Bu yapılandırma olmadan uygulama, `AI_PROVIDER` ve `AI_MODEL` değişkenlerini kullanır.

Üç yoldan biriyle kurabilirsiniz.

### Yapılandırmayı bir ortam değişkenine koymak

Bu yol, bulut dağıtımları için önerilir. `AI_MODELS_CONFIG`i bir JSON dizesine ayarlayın:

```bash
AI_MODELS_CONFIG='{"providers":[{"name":"OpenAI","provider":"openai","models":["gpt-4o"],"default":true}]}'
```

### Bir yapılandırma dosyası kullanmak

Proje kökünde bir `ai-models.json` dosyası oluşturun. Onu başka bir yerde tutmak için `AI_MODELS_CONFIG_PATH`i konumuna ayarlayın.

### AI_MODEL içinde birkaç model listelemek

Bu, tek bir sağlayıcı için hızlı bir kurulumdur. Yalnızca bir sağlayıcıdan birkaç modele ihtiyacınız varsa onları `AI_MODEL` içinde virgülle ayırarak listeleyin. İlk model varsayılan olur.

```bash
AI_PROVIDER=doubao
AI_MODEL=doubao-seed-1-8-251228,doubao-seed-1-6-flash-250828,doubao-seed-1-6-251015
```

Bu, aynı `ai-models.json`un kısa yazımıdır. Birkaç sağlayıcı için ya da kendi `apiKeyEnv` ve `baseUrlEnv`leriniz için ortam değişkenini ya da yapılandırma dosyasını kullanın.

### Örnek

```json
{
  "providers": [
    {
      "name": "OpenAI Production",
      "provider": "openai",
      "models": ["gpt-4o", "gpt-4o-mini"],
      "default": true
    },
    {
      "name": "Custom DeepSeek",
      "provider": "deepseek",
      "models": ["deepseek-chat"],
      "apiKeyEnv": "MY_DEEPSEEK_KEY",
      "baseUrlEnv": "MY_DEEPSEEK_URL"
    }
  ]
}
```

### Alanlar

| Alan | Zorunlu | Ne yapar |
|---|---|---|
| `name` | Evet | Görünen ad. Birkaç yapılandırma aynı sağlayıcıyı kullanabilir |
| `provider` | Evet | Sağlayıcı türü (`openai`, `anthropic`, `google`, `bedrock` vb.) |
| `models` | Evet | Model kimliklerinin listesi |
| `default` | Hayır | `true`, bu sağlayıcının ilk modelini varsayılan olarak seçer |
| `apiKeyEnv` | Hayır | Özel bir API anahtar değişkeninin adı. Olmadan, sağlayıcının standart değişkeni kullanılır; örneğin `OPENAI_API_KEY`. Ayrıca bir değişken adları dizisi olabilir: her istek, değeri olan birini rastgele seçer; bu, yükü birkaç anahtara yayar |
| `baseUrlEnv` | Hayır | Özel bir taban URL değişkeninin adı |

### Anahtarlar ve adlar

- API anahtarları ve kimlik bilgileri ortam değişkenlerinden gelir. Varsayılan olarak standart adlar kullanılır; örneğin `OPENAI_API_KEY`. `apiKeyEnv` ile kendi adlarınızı kullanabilirsiniz.
- `name` ile bir sağlayıcının birkaç yapılandırması olabilir. Örneğin "OpenAI Production" ve "OpenAI Staging" ikisi de farklı `apiKeyEnv` değerleriyle `provider: "openai"` kullanabilir.

## Model seçme

Çizim için model, katı bir biçime uymak zorunda olan uzun draw.io XML'i yazar; dolayısıyla bu görev çok yetenekli bir model gerektirir.

Önerilen modeller: Claude Sonnet 4.5 ya da Opus 4.5.

Ollama bir sağlayıcı olarak desteklenir. Bu görev için genellikle yalnızca yerel olarak DeepSeek R1 ya da Qwen3-235B gibi güçlü bir model çalıştırdığınızda pratiktir.

| Ne istiyorsunuz | Ne kullanmalısınız |
|---|---|
| En iyi deneyim | Resim okuyabilen bir model (GPT-4o, Claude, Gemini); resimleri diyagrama çevirmek için |
| Düşük maliyet | Rekabetçi fiyatlı DeepSeek |
| Gizlilik | Tamamen yerel ve çevrimdışı Ollama. Güçlü donanım gerekir |
| Esneklik | Tek bir API ile birçok model veren OpenRouter |

## Sıcaklığı ayarlama

Sıcaklığı (temperature) ayarlamak isteğe bağlıdır. Bir ortam değişkeniyle ayarlayın:

```bash
TEMPERATURE=0  # More deterministic output (recommended for diagrams)
```

**Önemli:** Sıcaklık ayarını desteklemeyen modeller için `TEMPERATURE`i ayarlanmamış bırakın; örneğin:

- GPT-5.1 ve diğer akıl yürütme modelleri
- Bazı özel modeller

Ayarlanmadığında model kendi varsayılan davranışını kullanır.

## Yeni bir sağlayıcı ekleme

Bir sağlayıcıya dair her şey, `lib/providers.ts` içinde tek bir kayıttadır:

- hangi AI SDK onu çalıştırır (`sdk`)
- neyle oturum açtığı (`credential`)
- `<PREFIX>_API_KEY` ve `<PREFIX>_BASE_URL` değişkenlerinin öneki (`envPrefix`)
- resmî adresi
- sağlayıcı seçicideki grubu
- isteğe bağlı notlar

Ayarlar ekranı, bağlantı testi, sohbet rotası ve yönetim paneli bu kaydı okur. OpenAI uyumlu bir sağlayıcı eklemek için:

1. `lib/providers.ts` içine bir kayıt ekleyin; örneğin:

    ```ts
    acme: {
        label: "Acme AI",
        sdk: "openai-compatible",
        credential: "apiKey",
        group: "aggregators",
        envPrefix: "ACME",
        defaultBaseUrl: "https://api.acme.example/v1",
        apiKeyUrl: "https://acme.example/keys",
        modelList: "openai",
    },
    ```

    Sağlayıcı, taban URL alanının altında bir ipucu ya da seçicide bir not gerektiriyorsa ona dört arayüz diliyle (`tr`, `en`, `zh`, `ja`, `zh-Hant`) bir `baseUrlHint` ya da `note` nesnesi verin. Modellerini çevrimiçi listeleyemeyen bir sağlayıcı, `modelList` yerine kısa bir `models` listesi alır.
2. `env.example` içine `ACME_API_KEY` ve `ACME_BASE_URL` ekleyin. Bir birim test, her kaydın değişkenlerinin orada olduğunu denetler.
3. Bu sayfaya `docs/tr`, `docs/en`, `docs/cn`, `docs/tw` ve `docs/ja` içinde bir bölüm ekleyin.
4. `tests/unit/provider-matrix.test.ts`nin üstündeki iki listeye ekleyin (`MATRIX_PROVIDERS` ve `MATRIX_MODEL_IDS`). Sonra davranış anlık görüntüsünü `npx vitest run tests/unit/provider-matrix.test.ts -u` ile yeniden üretin. Yeni satırlar yeni sağlayıcıya ait olmalı ve mevcut satırlar değişmemelidir.
5. `tests/unit/providers.test.ts` içine de ekleyin. O dosya, seçicinin gruplarını ve sunucunun ne yaptığını değiştiren sağlayıcı kümelerini (otomatik algılama, anahtarsız model listeleri) yazar.
6. Üç README'deki sağlayıcı sayısını ve bu sayfadaki `AI_PROVIDER` listesini güncelleyin.
