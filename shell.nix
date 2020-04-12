with import <nixpkgs> {};
llvmPackages_10.stdenv.mkDerivation {
    name = "_";
    buildInputs = [
        htmlTidy
        nodejs
        shellcheck
    ];
    shellHook = ''
        . .shellhook
    '';
}
