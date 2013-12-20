param(
    [string] $artifactPath =
    $(throw @"
    Usage: UpdateRollbar.ps1 <artifactPath> <environment> [curl]`n
    `t artifactPath: Path to the build artifacts `n
    `t environment: Envrionment name (e.g. dev, uat, production) `n
    `t curl: optional (if CURL environment variable is not set) full path to the curl executable (e.g. c:\utils\curl.exe)
"@),
    [string] $environment =
    $(throw @"
    Usage: UpdateRollbar.ps1 <artifactPath> <environment> [curl]`n
    `t artifactPath: Path to the build artifacts `n
    `t environment: Envrionment name (e.g. dev, uat, production) `n
    `t curl: optional (if CURL environment variable is not set) full path to the curl executable (e.g. c:\utils\curl.exe)
"@),
    [string] $curl = $null,
    [switch]$WhatIf=$false
)


trap {
    write-host $_
    break
}

function execute-process($command, $opts, $checkerror = $true) {
    process {  
        
        $optionsText = $opts -join " "
        write-host "Command: $command $optionsText"
        
        if ($WhatIf -eq $false) {
            # this incredibly convoluted bit of code is to execute a process without all the hassles of quoting
            # which are a miserable descent into hell for most things and powershell
            $stdouttemp = [System.IO.Path]::GetTempFileName()
            $stderrtemp = [System.IO.Path]::GetTempFilename()
            $process = start-process $command $opts -wait -noNewWindow -passThru -redirectStandardOutput $stdouttemp -redirectStandardError $stderrtemp
            gc $stdouttemp
            gc $stderrtemp
        
            if ($checkerror -and $process.ExitCode -ne 0) {
                $ec = $process.ExitCode
                throw "$command failed returned exit code: $ec"
            }   
            get-content $stdouttemp
        }
    }
}

$BasePath = [System.IO.Path]::GetDirectoryName($MyInvocation.MyCommand.Definition)

if ($curl -eq $null -or $curl.Length -eq 0) {
    $curl = $Env:Curl
}

if ($curl -eq $null -or (test-path $curl) -eq $false) {
    throw "Curl not found at `"$curl`". Pass as a parameter (-curl `"path\to\curl\curl.exe`") or set the CURL environment variable"
}

# Configuration
$rollbarApiKey = "d9da7f12d9d540b587053271608193b9"
$rollbarSourceMapEndpoint = "https://api.rollbar.com/api/1/sourcemap"
$rollbarDeployEndpoint = "https://api.rollbar.com/api/1/deploy/"
$version = Get-Content (join-path $artifactPath "mars-build-commit.txt")
$minifiedBaseUrl = switch ($environment) {
   "dev" { "http://app.dev.trainingpeaks.com/" }
   #"uat" { "http://app.uat.trainingpeaks.com/" }
   "uat" { "http://app.sandbox.trainingpeaks.com/" }
   "production" { "http://app.trainingpeaks.com/" }
    default { throw "Invalid enviroment $environment" }
}
$sourceMapPath = join-path $artifactPath "mapfiles"

$mapfiles = gci $sourceMapPath -recurse -include "*.map"

if ($mapfiles.Length -eq 0) {
    throw "No map files found in `"$sourceMapPath`". Not good."
}

function add-rollbarOptions($opts, [string]$name, [string]$value) {
    $opts += ("-F " + $name + "=" + $value)
    $opts
}

function create-rollbarOptions([string] $url) {
    $opts = , $url
    $opts = add-rollbarOptions $opts "access_token" $rollbarApiKey
    $opts += '--insecure'
    $opts
}

function get-mapdirectoryPath($dir) {
    if ($dir.Directory.BaseName -eq "mapfiles") { 
        $path = "" 
    } 
    else { 
        $path = ($dir.Directory.BaseName + "/") 
    } 
    $path
}

#update rollbar with map files
foreach ($mapfile in $mapfiles) {
    $minFileDir = get-mapdirectoryPath $mapfile
    $minifiedUrl = $minifiedBaseUrl + $minFileDir + $mapfile.BaseName
    $opts = create-rollbarOptions $rollbarSourceMapEndpoint
    $opts = add-rollbarOptions $opts "version" $version
    $opts = add-rollbarOptions $opts "minified_url" $minifiedUrl
    $opts = add-rollbarOptions $opts "source_map" ("`"@" + $mapfile.FullName + '"')
    
    execute-process $curl $opts
}

# update rollbar deployment
$opts = create-rollbarOptions $rollbarDeployEndpoint
$opts = add-rollbarOptions $opts "environment" $environment
$opts = add-rollbarOptions $opts "revision" $version
$opts = add-rollbarOptions $opts "local_username" "$Env:Username"
execute-process $curl $opts