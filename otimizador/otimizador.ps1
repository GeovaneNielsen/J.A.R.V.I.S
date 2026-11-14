#Requires -Version 5.1
<#
  J.A.R.V.I.S - Otimizador de PC (Windows 10/11)
  Tudo o que muda é registrado em backup e pode ser desfeito pela opção [R] do menu.
#>

$ErrorActionPreference = 'SilentlyContinue'
$Base    = Split-Path -Parent $MyInvocation.MyCommand.Path
$Backup  = Join-Path $Base 'backup'
$Estado  = Join-Path $Backup 'estado.json'
$Log     = Join-Path $Base ("relatorio-{0:yyyy-MM-dd_HH-mm}.txt" -f (Get-Date))
if ($Base -like "$env:TEMP*" -or $Base -like "$env:SystemRoot\Temp*") {
    Write-Host "`n  O otimizador está rodando de dentro do .zip (pasta temporária)." -ForegroundColor Red
    Write-Host "  Extraia o .zip (botão direito > Extrair tudo) e abra o Otimizar.bat da pasta extraída.`n" -ForegroundColor Red
    exit 1
}
New-Item -ItemType Directory -Force -Path $Backup | Out-Null
$script:PontoFeito = $false
$EhNotebook = [bool](Get-CimInstance Win32_Battery)

# ---------- utilidades ----------
function Diga($t, $c = 'Cyan') { Write-Host "  $t" -ForegroundColor $c; Add-Content $Log $t }
function Ok($t)    { Diga "[ok] $t" 'Green' }
function Aviso($t) { Diga "[!]  $t" 'Yellow' }

function Ler-Estado {
    $e = $null
    if (Test-Path $Estado) { $e = Get-Content $Estado -Raw | ConvertFrom-Json }
    if (-not $e) { $e = [pscustomobject]@{ registro = @(); servicos = @(); plano = $null } }
    $e.registro = @($e.registro | Where-Object { $_ })
    $e.servicos = @($e.servicos | Where-Object { $_ })
    $e
}
function Salvar-Estado($e) { $e | ConvertTo-Json -Depth 5 | Set-Content $Estado -Encoding UTF8 }

# Grava um valor no registro guardando o valor antigo (uma vez só) para poder desfazer.
function Definir-Registro($Caminho, $Nome, $Valor, $Tipo = 'DWord') {
    $e = Ler-Estado
    if (-not ($e.registro | Where-Object { $_.caminho -eq $Caminho -and $_.nome -eq $Nome })) {
        $antigo = (Get-ItemProperty -Path $Caminho -Name $Nome -ErrorAction SilentlyContinue).$Nome
        $e.registro += [pscustomobject]@{ caminho = $Caminho; nome = $Nome; valor = $antigo; tipo = $Tipo; existia = ($null -ne $antigo) }
        Salvar-Estado $e
    }
    if (-not (Test-Path $Caminho)) { New-Item -Path $Caminho -Force | Out-Null }
    Set-ItemProperty -Path $Caminho -Name $Nome -Value $Valor -Type $Tipo -Force
}

function Ajustar-Servico($Nome, $Inicio) {
    $s = Get-Service -Name $Nome -ErrorAction SilentlyContinue
    if (-not $s) { return }
    $e = Ler-Estado
    if (-not ($e.servicos | Where-Object { $_.nome -eq $Nome })) {
        $e.servicos += [pscustomobject]@{ nome = $Nome; inicio = [string]$s.StartType }
        Salvar-Estado $e
    }
    if ($Inicio -eq 'Disabled') { Stop-Service $Nome -Force }
    Set-Service -Name $Nome -StartupType $Inicio
}

function Tamanho-Livre { [math]::Round((Get-PSDrive C).Free / 1GB, 2) }

# ---------- 0. segurança ----------
function Ponto-Restauracao {
    if ($script:PontoFeito) { return }
    Diga "Criando ponto de restauração do sistema..."
    Enable-ComputerRestore -Drive "$env:SystemDrive\"
    # O Windows limita a 1 ponto a cada 24h; liberamos isso só para este ponto.
    $k = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\SystemRestore'
    Definir-Registro $k 'SystemRestorePointCreationFrequency' 0
    Checkpoint-Computer -Description 'JARVIS - antes da otimizacao' -RestorePointType MODIFY_SETTINGS
    if ($?) { $script:PontoFeito = $true; Ok "Ponto de restauração criado." } else { Aviso "Não consegui criar o ponto de restauração (a Proteção do Sistema pode estar desligada)." }
}

# ---------- 1. limpeza ----------
function Limpeza {
    Diga "Limpando arquivos temporários e caches..."
    $antes = Tamanho-Livre
    $pastas = @(
        "$env:TEMP\*", "$env:SystemRoot\Temp\*",
        "$env:LOCALAPPDATA\Microsoft\Windows\INetCache\*",
        "$env:LOCALAPPDATA\Microsoft\Windows\Explorer\thumbcache_*.db",
        "$env:LOCALAPPDATA\CrashDumps\*", "$env:SystemRoot\Minidump\*",
        "$env:ProgramData\Microsoft\Windows\WER\ReportArchive\*",
        "$env:ProgramData\Microsoft\Windows\WER\ReportQueue\*",
        "$env:LOCALAPPDATA\D3DSCache\*",
        "$env:LOCALAPPDATA\NVIDIA\DXCache\*", "$env:LOCALAPPDATA\NVIDIA\GLCache\*",
        "$env:LOCALAPPDATA\AMD\DxCache\*"
    )
    foreach ($p in $pastas) { Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue }

    # Cache do Windows Update: só mexe se não houver atualização instalando ou esperando reinício
    $ocupado = (Get-Process TiWorker, TrustedInstaller -ErrorAction SilentlyContinue) -or
               (Test-Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update\RebootRequired') -or
               (Test-Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Component Based Servicing\RebootPending')
    if ($ocupado) {
        Aviso "O Windows Update está trabalhando ou esperando reinício: pulei o cache dele e o DISM."
    } else {
        Stop-Service wuauserv, bits -Force
        Remove-Item "$env:SystemRoot\SoftwareDistribution\Download\*" -Recurse -Force
        Start-Service wuauserv, bits
    }

    Clear-RecycleBin -Force
    ipconfig /flushdns | Out-Null

    # Componentes antigos do Windows (pode demorar alguns minutos)
    if (-not $ocupado) {
        Diga "Removendo versões antigas de componentes do Windows (DISM)... pode demorar."
        Dism.exe /Online /Cleanup-Image /StartComponentCleanup /Quiet | Out-Null
    }

    $depois = Tamanho-Livre
    Ok ("Limpeza concluída: {0} GB liberados." -f [math]::Max(0, [math]::Round($depois - $antes, 2)))
}

# ---------- 2. energia ----------
function Energia {
    Diga "Ativando plano de energia de desempenho máximo..."
    $e = Ler-Estado
    if (-not $e.plano) {
        $atual = (powercfg /getactivescheme) -replace '.*:\s*([a-f0-9-]{36}).*', '$1'
        $e.plano = $atual.Trim(); Salvar-Estado $e
    }
    if ($EhNotebook) {
        # Em notebook o 'Desempenho Máximo' esquenta e acaba com a bateria; Alto Desempenho é o limite sensato.
        powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c
        Ok "Notebook detectado: plano 'Alto Desempenho' ativado. Hibernação mantida (protege contra bateria acabando)."
        return
    }
    # Reaproveita o plano se já foi criado antes, para não acumular cópias
    $linha = powercfg /list | Select-String 'Desempenho M[aá]ximo|Ultimate Performance' | Select-Object -First 1
    $guid = if ($linha) { ([regex]'[a-f0-9-]{36}').Match("$linha").Value } else { $null }
    if (-not $guid) {
        $saida = powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 2>$null
        $guid = ([regex]'[a-f0-9-]{36}').Match("$saida").Value
    }
    if ($guid) { powercfg /setactive $guid; Ok "Plano 'Desempenho Máximo' ativado." }
    else { powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c; Ok "Plano 'Alto Desempenho' ativado." }
    powercfg /hibernate off   # libera o hiberfil.sys (vários GB) e desliga a inicialização rápida
    Ok "Hibernação desligada (espaço liberado)."
}

# ---------- 3. jogos e gráficos ----------
function Jogos {
    Diga "Ajustando Windows para jogos..."
    Definir-Registro 'HKCU:\Software\Microsoft\GameBar' 'AutoGameModeEnabled' 1
    Definir-Registro 'HKCU:\Software\Microsoft\GameBar' 'AllowAutoGameMode' 1
    # Desliga a gravação em segundo plano (Game DVR), que custa FPS
    Definir-Registro 'HKCU:\System\GameConfigStore' 'GameDVR_Enabled' 0
    Definir-Registro 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\GameDVR' 'AllowGameDVR' 0
    # Agendamento de GPU acelerado por hardware (efeito após reiniciar)
    Definir-Registro 'HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers' 'HwSchMode' 2
    # Prioridade de CPU/GPU para jogos
    $mm = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile'
    Definir-Registro $mm 'SystemResponsiveness' 10
    Definir-Registro "$mm\Tasks\Games" 'GPU Priority' 8
    Definir-Registro "$mm\Tasks\Games" 'Priority' 6
    Definir-Registro "$mm\Tasks\Games" 'Scheduling Category' 'High' 'String'
    # Aceleração do mouse desligada (mira mais precisa)
    Definir-Registro 'HKCU:\Control Panel\Mouse' 'MouseSpeed' '0' 'String'
    Definir-Registro 'HKCU:\Control Panel\Mouse' 'MouseThreshold1' '0' 'String'
    Definir-Registro 'HKCU:\Control Panel\Mouse' 'MouseThreshold2' '0' 'String'
    Ok "Modo de Jogo ligado, Game DVR desligado, prioridade de jogos elevada."
}

# ---------- 4. visual e resposta ----------
function Visual {
    Diga "Priorizando desempenho nos efeitos visuais..."
    Definir-Registro 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects' 'VisualFXSetting' 2
    Definir-Registro 'HKCU:\Control Panel\Desktop' 'MenuShowDelay' '0' 'String'
    Definir-Registro 'HKCU:\Control Panel\Desktop\WindowMetrics' 'MinAnimate' '0' 'String'
    Definir-Registro 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize' 'EnableTransparency' 0
    Definir-Registro 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced' 'TaskbarAnimations' 0
    # Sugestões, dicas e anúncios do Windows
    $cdm = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager'
    foreach ($n in 'SubscribedContent-338388Enabled','SubscribedContent-338389Enabled','SubscribedContent-353694Enabled','SystemPaneSuggestionsEnabled','SilentInstalledAppsEnabled') {
        Definir-Registro $cdm $n 0
    }
    Ok "Animações, transparência e anúncios desligados."
}

# ---------- 5. privacidade e serviços ----------
function Servicos {
    Diga "Desligando telemetria e serviços dispensáveis..."
    Definir-Registro 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection' 'AllowTelemetry' 0
    Ajustar-Servico 'DiagTrack' 'Disabled'          # telemetria
    Ajustar-Servico 'dmwappushservice' 'Disabled'   # telemetria (push WAP)
    Ajustar-Servico 'WerSvc' 'Manual'               # relatório de erros
    Ajustar-Servico 'MapsBroker' 'Manual'           # mapas offline
    Ajustar-Servico 'RetailDemo' 'Disabled'         # modo demonstração de loja
    Ajustar-Servico 'Fax' 'Manual'
    # SysMain (Superfetch) só atrapalha quando o disco do sistema é SSD/NVMe
    $disco = Get-PhysicalDisk | Where-Object { $_.DeviceId -eq ((Get-Partition -DriveLetter C).DiskNumber) }
    if ($disco.MediaType -eq 'SSD') { Ajustar-Servico 'SysMain' 'Manual'; Ok "SysMain em manual (disco do sistema é SSD)." }
    # Indexação da pesquisa fica, mas sem rodar com o PC ocupado
    Ok "Telemetria e serviços dispensáveis ajustados."
}

# ---------- 6. disco ----------
function Disco {
    Diga "Otimizando discos (TRIM em SSD, desfragmentação em HD)..."
    Get-Volume | Where-Object { $_.DriveLetter -and $_.DriveType -eq 'Fixed' } | ForEach-Object {
        Optimize-Volume -DriveLetter $_.DriveLetter -Verbose:$false
        Ok "Unidade $($_.DriveLetter): otimizada."
    }
}

# ---------- 7. reparo ----------
function Reparo {
    Diga "Verificando integridade do Windows (DISM + SFC)... leva de 10 a 30 minutos."
    Dism.exe /Online /Cleanup-Image /RestoreHealth
    sfc /scannow
    Ok "Verificação concluída."
}

# ---------- 8. inicialização ----------
function Inicializacao {
    Diga "Programas que abrem junto com o Windows:" 'White'
    $itens = Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location
    if (-not $itens) { Ok "Nenhum programa encontrado."; return }
    $i = 0; foreach ($it in $itens) { $i++; Diga ("  {0,2}. {1}" -f $i, $it.Name) 'White' }
    Aviso "Para desligar algum: Ctrl+Shift+Esc > Aplicativos de inicialização > Desabilitar."
    Aviso "Não removo nada aqui sozinho: antivírus e drivers costumam estar nessa lista."
    Start-Process taskmgr -ArgumentList '/0 /startup'
}

# ---------- 9. bloatware ----------
function Bloatware {
    Diga "Removendo apps pré-instalados que quase ninguém usa..."
    $lista = @(
        'Microsoft.BingNews','Microsoft.BingWeather','Microsoft.GetHelp','Microsoft.Getstarted',
        'Microsoft.MicrosoftSolitaireCollection','Microsoft.People','Microsoft.WindowsFeedbackHub',
        'Microsoft.ZuneVideo','Microsoft.ZuneMusic','Microsoft.MixedReality.Portal','Microsoft.SkypeApp',
        'Microsoft.Microsoft3DViewer','Microsoft.MicrosoftOfficeHub','Microsoft.Todos','Clipchamp.Clipchamp',
        'Microsoft.PowerAutomateDesktop','MicrosoftCorporationII.QuickAssist','Microsoft.549981C3F5F10',
        'king.com.CandyCrushSaga','king.com.CandyCrushSodaSaga','SpotifyAB.SpotifyMusic','Disney.37853FA22FAF4',
        'BytedancePte.Ltd.TikTok','Facebook.Facebook','Facebook.Instagram'
    )
    foreach ($app in $lista) {
        $p = Get-AppxPackage -Name $app
        if ($p) { $p | Remove-AppxPackage; Ok "Removido: $app" }
    }
    Aviso "A Xbox App e a Microsoft Store foram mantidas (jogos precisam delas). Removidos podem ser reinstalados pela Store."
}

# ---------- D. drivers ----------
function Drivers {
    Ponto-Restauracao

    # 1. Cópia dos drivers atuais, para poder voltar atrás
    $copia = Join-Path $Backup ("drivers-{0:yyyy-MM-dd}" -f (Get-Date))
    if (-not (Test-Path $copia)) {
        Diga "Copiando os drivers atuais para $copia ..."
        New-Item -ItemType Directory -Force -Path $copia | Out-Null
        Export-WindowsDriver -Online -Destination $copia | Out-Null
        Ok "Cópia feita. Para restaurar um driver: pnputil /add-driver `"$copia\*.inf`" /subdirs /install"
    }

    # 2. Dispositivos sem driver ou com problema
    Diga "Procurando dispositivos sem driver ou com erro..."
    $ruins = Get-PnpDevice -PresentOnly | Where-Object { $_.Status -in 'Error','Unknown','Degraded' }
    if ($ruins) { foreach ($d in $ruins) { Aviso "Com problema: $($d.FriendlyName) [$($d.Class)] - código $($d.ConfigManagerErrorCode)" } }
    else { Ok "Todos os dispositivos estão com driver." }

    # 3. Drivers pelo Windows Update (assinados e testados pela Microsoft)
    Diga "Buscando drivers no Windows Update... pode levar alguns minutos."
    try {
        $sessao  = New-Object -ComObject Microsoft.Update.Session
        $busca   = $sessao.CreateUpdateSearcher()
        $busca.ServerSelection = 2   # Windows Update
        $res = $busca.Search("IsInstalled=0 and Type='Driver' and IsHidden=0")
        if ($res.Updates.Count -eq 0) {
            Ok "Nenhum driver novo no Windows Update."
        } else {
            $lote = New-Object -ComObject Microsoft.Update.UpdateColl
            foreach ($u in $res.Updates) {
                Diga ("  - {0}  ({1})" -f $u.Title, $u.DriverManufacturer) 'White'
                if (-not $u.EulaAccepted) { $u.AcceptEula() }
                [void]$lote.Add($u)
            }
            $resp = Read-Host "   Instalar estes $($lote.Count) driver(s)? (S/N)"
            if ($resp -match '^[sS]') {
                Diga "Baixando..."
                $dl = $sessao.CreateUpdateDownloader(); $dl.Updates = $lote; [void]$dl.Download()
                Diga "Instalando..."
                $inst = $sessao.CreateUpdateInstaller(); $inst.Updates = $lote
                $r = $inst.Install()
                for ($i = 0; $i -lt $lote.Count; $i++) {
                    $c = $r.GetUpdateResult($i).ResultCode
                    if ($c -eq 2) { Ok $lote.Item($i).Title } else { Aviso "Falhou ($c): $($lote.Item($i).Title)" }
                }
                if ($r.RebootRequired) { Aviso "Reinicie o computador para concluir a instalação." }
            }
        }
    } catch { Aviso "Não consegui consultar o Windows Update: $($_.Exception.Message)" }

    # 4. Placa de vídeo: o driver do fabricante é mais novo que o do Windows Update
    Diga "Verificando a placa de vídeo..."
    foreach ($gpu in Get-CimInstance Win32_VideoController) {
        $nome = $gpu.Name
        $data = if ($gpu.DriverDate) { $gpu.DriverDate.ToString('dd/MM/yyyy') } else { '?' }
        Diga "  $nome - driver $($gpu.DriverVersion) de $data" 'White'
        $site = $null; $winget = $null; $id = "$($gpu.PNPDeviceID)"
        if     ($id -match 'VEN_10DE' -or $nome -match 'NVIDIA')     { $site = 'https://www.nvidia.com/pt-br/drivers/';  $winget = 'Nvidia.NvidiaApp' }
        elseif ($id -match 'VEN_1002' -or $nome -match 'AMD|Radeon') { $site = 'https://www.amd.com/pt/support/download/drivers.html' }
        elseif ($id -match 'VEN_8086' -or $nome -match 'Intel')      { $site = 'https://www.intel.com.br/content/www/br/pt/support/detect.html' }
        if (-not $site) { continue }

        $instalado = $false
        if ($winget -and (Get-Command winget -ErrorAction SilentlyContinue)) {
            $resp = Read-Host "   Instalar o app oficial da NVIDIA (mantém o driver de vídeo sempre atualizado)? (S/N)"
            if ($resp -match '^[sS]') {
                winget install --id $winget -e --accept-source-agreements --accept-package-agreements
                if ($LASTEXITCODE -eq 0) { Ok "App da NVIDIA instalado. Abra-o e clique em 'Drivers' > 'Baixar'."; $instalado = $true }
            }
        }
        if (-not $instalado) {
            Aviso "Abrindo a página oficial de drivers do fabricante (detecta sua placa automaticamente)."
            Start-Process $site
        }
    }
    Ok "Verificação de drivers concluída."
}

# ---------- R. desfazer ----------
function Desfazer {
    $e = Ler-Estado
    Diga "Desfazendo alterações do JARVIS..."
    foreach ($r in $e.registro) {
        if ($r.existia) { Set-ItemProperty -Path $r.caminho -Name $r.nome -Value $r.valor -Type $r.tipo -Force }
        else { Remove-ItemProperty -Path $r.caminho -Name $r.nome -Force }
    }
    foreach ($s in $e.servicos) { Set-Service -Name $s.nome -StartupType $s.inicio; if ($s.inicio -eq 'Automatic') { Start-Service $s.nome } }
    if ($e.plano) { powercfg /setactive $e.plano }
    powercfg /hibernate on
    Remove-Item $Estado -Force
    Ok "Configurações restauradas. Apps removidos voltam pela Microsoft Store; para o resto, use o ponto de restauração."
    Aviso "Reinicie o computador para concluir."
}

function Tudo {
    Ponto-Restauracao; Limpeza; Drivers; Energia; Jogos; Visual; Servicos; Disco
    Diga ""
    Aviso "Reinicie o computador para que tudo tenha efeito."
}

# ---------- menu ----------
$Host.UI.RawUI.WindowTitle = 'J.A.R.V.I.S - Otimizador'
while ($true) {
    Clear-Host
    Write-Host ""
    Write-Host "   J . A . R . V . I . S   —   Otimizador de PC" -ForegroundColor Cyan
    Write-Host ("   Espaço livre em C: {0} GB" -f (Tamanho-Livre)) -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "   [1] OTIMIZAÇÃO COMPLETA (recomendado)" -ForegroundColor Green
    Write-Host "   [2] Só limpeza de arquivos"
    Write-Host "   [3] Plano de energia máximo"
    Write-Host "   [4] Ajustes para jogos"
    Write-Host "   [5] Efeitos visuais e anúncios"
    Write-Host "   [6] Telemetria e serviços"
    Write-Host "   [7] Otimizar discos"
    Write-Host "   [8] Ver programas de inicialização"
    Write-Host "   [9] Remover bloatware"
    Write-Host "   [D] Procurar e instalar drivers" -ForegroundColor Green
    Write-Host "   [S] Reparar Windows (DISM + SFC, demorado)"
    Write-Host "   [R] DESFAZER tudo" -ForegroundColor Yellow
    Write-Host "   [0] Sair"
    Write-Host ""
    $op = Read-Host "   Senhor, qual opção"
    Write-Host ""
    switch ($op.ToUpper()) {
        '1' { Tudo }
        '2' { Limpeza }
        '3' { Energia }
        '4' { Ponto-Restauracao; Jogos }
        '5' { Visual }
        '6' { Ponto-Restauracao; Servicos }
        '7' { Disco }
        '8' { Inicializacao }
        '9' { Ponto-Restauracao; Bloatware }
        'D' { Drivers }
        'S' { Reparo }
        'R' { Desfazer }
        '0' { exit }
        default { Aviso "Opção inválida." }
    }
    Write-Host ""
    Write-Host "   Relatório salvo em: $Log" -ForegroundColor DarkGray
    Read-Host "   Enter para voltar ao menu" | Out-Null
}
