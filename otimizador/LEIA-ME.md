# J.A.R.V.I.S — Otimizador de PC (Windows 10/11)

0. **Windows recém-formatado:** rode o Windows Update até não sobrar nada e reinicie antes. Assim os drivers vêm completos e o otimizador não atrapalha atualizações em andamento.
1. Baixe a pasta `otimizador` inteira.
2. Clique duas vezes em **`Otimizar.bat`** e aceite o pedido de administrador.
3. Escolha **[1] Otimização completa** e reinicie o PC no fim.

## O que ele faz
| Opção | Efeito |
|---|---|
| Limpeza | Temporários, cache do Windows Update, cache de shaders, lixeira, DNS, componentes antigos (DISM) |
| Energia | Plano "Desempenho Máximo" e hibernação desligada (libera vários GB). Em notebook: "Alto Desempenho" e hibernação mantida |
| Jogos | Modo de Jogo, Game DVR desligado, agendamento de GPU por hardware, prioridade de jogos, sem aceleração do mouse |
| Visual | Sem animações/transparência, sem anúncios do Windows |
| Serviços | Telemetria desligada; SysMain em manual se o disco for SSD |
| Disco | TRIM em SSD, desfragmentação em HD |
| Inicialização | Lista o que abre com o Windows e abre o Gerenciador de Tarefas (você escolhe o que desligar) |
| Bloatware | Remove Candy Crush, TikTok, Notícias etc. (mantém Store e Xbox) |
| Drivers | Copia os drivers atuais, aponta dispositivos sem driver, instala drivers novos do Windows Update (pergunta antes) e, para a placa de vídeo, instala o app oficial da NVIDIA ou abre a página oficial da AMD/Intel |
| Reparo | DISM + SFC |

## Segurança
- Cria um **ponto de restauração** antes de mexer.
- Guarda o valor antigo de cada ajuste em `backup/estado.json`; a opção **[R]** desfaz tudo.
- Antes de instalar drivers, salva uma cópia dos atuais em `backup/drivers-AAAA-MM-DD`.
- Só instala drivers de fontes oficiais (Windows Update e fabricantes) — nada de "Driver Booster" e afins.
- Não desliga antivírus, Windows Update, nem mexe em drivers ou BIOS — esses "tweaks" prometem muito e costumam quebrar o sistema.
