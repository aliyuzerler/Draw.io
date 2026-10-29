# Diğer MCP istemcileri

MCP sunucusu, yerel MCP sunucularını stdio üzerinden çalıştıran her istemciyle çalışır: Codex CLI, VS Code, Cursor, Claude Desktop, Cline ve daha fazlası. Node.js 18 ya da üstü gerekir. Claude Code için bkz. [Claude Code'dan kullanın](./claude-code.md).

## Kurlumu aracınıza yaptırın

Bunu Codex, Cursor, VS Code, Cline ya da dosya düzenleyip komut çalıştırabilen herhangi bir araca yapıştırın:

```text
Bulunduğun istemci için drawio MCP sunucusunu kur; kurulum talimatları şu adreste:
https://raw.githubusercontent.com/DayuanJiang/next-ai-draw-io/main/packages/mcp-server/README.md
Kurulumu tüm projelerim için yap (user scope; Claude Code'da "--scope user"),
sunucuya "drawio" adını ver ve hâlihazırda yapılandırılmış sunucuları koru.
Sonra araçlarının görünmesi için nasıl yeniden yükleyeceğimi söyle.
```

## Codex CLI

```bash
codex mcp add drawio -- npx @next-ai-drawio/mcp-server@latest
```

Codex, diyagramı değiştiren her drawio aracından önce sorar; tam erişimsiz `codex exec`, "MCP tool call requires approval" hatasıyla başarısız olur. drawio araçlarının sormadan çalışmasına izin vermek için `~/.codex/config.toml` içinde sunucunun bölümüne bir satır ekleyin:

```toml
[mcp_servers.drawio]
command = "npx"
args = ["@next-ai-drawio/mcp-server@latest"]
default_tools_approval_mode = "approve"
```

Yalnızca bazı araçları onaylamak için bunun yerine `[mcp_servers.drawio.tools.<araç adı>]` kullanın ve `approval_mode = "approve"` verin.

## VS Code

`.vscode/mcp.json` içinde:

```json
{
  "servers": {
    "drawio": { "type": "stdio", "command": "npx", "args": ["@next-ai-drawio/mcp-server@latest"] }
  }
}
```

## Cursor, Claude Desktop, Cline ve diğerleri

Çoğu istemci aynı biçimi kullanır: `~/.cursor/mcp.json`, `claude_desktop_config.json`, `cline_mcp_settings.json` ya da kendi MCP ayarlarında:

```json
{
  "mcpServers": {
    "drawio": { "command": "npx", "args": ["@next-ai-drawio/mcp-server@latest"] }
  }
}
```

Ayarlar, sunucunun `env`ine gider; örneğin `"env": { "DRAWIO_LANG": "tr" }`. Değişkenler, [Claude Code'dan kullanın](./claude-code.md#ayarlar) altında listelenir.

## Kurulumdan sonra

İstemciyi yeniden başlatın, sonra örneğin "Bu repoyu oku ve mimarisini çiz" deyin. Önizleme tarayıcınızda açılır ve diyagram, çizilirken görünür.

<!-- demo: mcp -->

Önizleme, başka sayfalara gömülmeyi reddeder; bu yüzden VS Code'un Simple Browser'ı ve Cursor'un tarayıcısı onu boş gösterir. Adresini normal bir tarayıcıda açın.
