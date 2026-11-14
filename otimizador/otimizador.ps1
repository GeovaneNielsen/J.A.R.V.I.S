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
New-Item -ItemType Directory -Force -Path $Backup | Out-Null

# ---------- utilidades ----------
function Diga($t, $c = 'Cyan') { Write-Host "  $t" -ForegroundColor $c; Add-Content $Log $t }
function Ok($t)    { Diga "[ok] $t" 'Green' }
function Aviso($t) { Diga "[!]  $t" 'Yellow' }

function Ler-Estado {
    if (Test-Path $Estado) { Get-Content $Estado -Raw | ConvertFrom-Json } else { [pscustomobject]@{ registro = @(); servicos = @(); plano = $null } }
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
    Diga "Criando ponto de restauração do sistema..."
    Enable-ComputerRestore -Drive "$env:SystemDrive\"
    # O Windows limita a 1 ponto a cada 24h; liberamos isso só para este ponto.
    $k = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\SystemRestore'
    Set-ItemProperty $k -Name SystemRestorePointCreationFrequency -Value 0 -Type DWord -Force
    Checkpoint-Computer -Description 'JARVIS - antes da otimizacao' -RestorePointType MODIFY_SETTINGS
    if ($?) { Ok "Ponto de restauração criado." } else { Aviso "Não consegui criar o ponto de restauração (a Proteção do Sistema pode estar desligada)." }
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

    # Cache do Windows Update
    Stop-Service wuauserv, bits -Force
    Remove-Item "$env:SystemRoot\SoftwareDistribution\Download\*" -Recurse -Force
    Start-Service wuauserv, bits

    Clear-RecycleBin -Force
    ipconfig /flushdns | Out-Null

    # Componentes antigos do Windows (pode demorar alguns minutos)
    Diga "Removendo versões antigas de componentes do Windows (DISM)... pode demorar."
    Dism.exe /Online /Cleanup-Image /StartComponentCleanup /Quiet | Out-Null

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
    $ultimate = 'e9a42b02-d5df-448d-aa00-03f14749eb61'
    $saida = powercfg -duplicatescheme $ultimate 2>$null
    $guid = ([regex]'[a-f0-9-]{36}').Match("$saida").Value
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
    # Apps em segundo plano
    Definir-Registro 'HKCU:\Software\Microsoft\Windows\CurrentVersion\BackgroundAccessApplications' 'GlobalUserDisabled' 1
    # Sugestões, dicas e anúncios do Windows
    $cdm = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager'
    foreach ($n in 'SubscribedContent-338388Enabled','SubscribedContent-338389Enabled','SubscribedContent-353694Enabled','SystemPaneSuggestionsEnabled','SilentInstalledAppsEnabled') {
        Definir-Registro $cdm $n 0
    }
    Ok "Animações, transparência, apps em segundo plano e anúncios desligados."
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
    Ponto-Restauracao; Limpeza; Energia; Jogos; Visual; Servicos; Disco
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
        'S' { Reparo }
        'R' { Desfazer }
        '0' { exit }
        default { Aviso "Opção inválida." }
    }
    Write-Host ""
    Write-Host "   Relatório salvo em: $Log" -ForegroundColor DarkGray
    Read-Host "   Enter para voltar ao menu" | Out-Null
}
